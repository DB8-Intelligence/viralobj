import { JobService } from './job.service';
import { generateSceneImages } from '../viral-objects/image-generation.service';
import {
  generateSceneAudios,
  type SceneAudioInput,
  type GeneratedSceneAudio,
} from '../viral-objects/audio-generation.service';
import type { SceneImagePrompt } from '../viral-objects/image-prompt-pack';
import type { SceneBlueprint } from '../viral-objects/scene-blueprint';
import { buildVideoTimeline, type VideoTimeline } from '../viral-objects/video-timeline';
import { buildVideoAssembly } from '../viral-objects/video-assembly';
import { renderVideo } from '../viral-objects/video-render.service';

type SceneBlueprintGroup = {
  objectId: string;
  scenes: SceneBlueprint[];
};

type JobInput = {
  generation_id?: string;
  scene_image_prompts?: SceneImagePrompt[];
  scene_blueprints?: SceneBlueprintGroup[];
  scene_texts?: Record<string, string> | null;
};

function resolveSceneText(
  scene: SceneBlueprint,
  sceneTexts: Record<string, string> | null | undefined
): string {
  return (
    sceneTexts?.[scene.sceneId] ??
    scene.overlayText ??
    scene.action ??
    scene.sceneType
  );
}

export class JobOrchestrator {
  private jobService = new JobService();

  /**
   * Roda o pipeline até (e incluindo) o step especificado.
   * Usado pelo wizard para rodar apenas parte do pipeline.
   */
  async runUntilStep(jobId: string, stopAfter: "ingest" | "image_generation" | "audio_generation" | "timeline_build" | "video_render") {
    const stepOrder = ["ingest", "image_generation", "audio_generation", "timeline_build", "video_render"];
    const stopIndex = stepOrder.indexOf(stopAfter);

    // Reusa o run() mas com flag interna
    return this.run(jobId, stopIndex);
  }

  async run(jobId: string, stopAfterIndex?: number) {
    try {
      await this.jobService.updateJob(jobId, { status: 'running', progress: 0 });

      // STEP 1 — ingest
      const ingest = await this.jobService.createStep(jobId, 'ingest');
      await this.jobService.updateStep(ingest.id, {
        status: 'running',
        started_at: new Date().toISOString(),
      });
      await new Promise((r) => setTimeout(r, 100));
      await this.jobService.updateStep(ingest.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      await this.jobService.updateJob(jobId, { progress: 10 });

      // Wizard: parar após ingest?
      if (stopAfterIndex !== undefined && stopAfterIndex <= 0) {
        await this.jobService.updateJob(jobId, { status: 'completed', progress: 100 });
        return;
      }

      const job = await this.jobService.getJob(jobId);
      const input = (job?.input ?? {}) as JobInput;

      // STEP 2 — image_generation
      const imageStep = await this.jobService.createStep(jobId, 'image_generation');
      let scene_images: Awaited<ReturnType<typeof generateSceneImages>> = [];
      try {
        await this.jobService.updateStep(imageStep.id, {
          status: 'running',
          started_at: new Date().toISOString(),
        });

        const prompts = input.scene_image_prompts ?? [];
        scene_images = await generateSceneImages(prompts);

        for (const img of scene_images) {
          await this.jobService.addArtifact(jobId, 'scene_image', img.imageUrl, {
            objectId: img.objectId,
            sceneId: img.sceneId,
            sceneType: img.sceneType,
            provider: img.provider,
            generatedAt: img.generatedAt,
          });
        }
        await this.jobService.addArtifact(
          jobId,
          'scene_images_batch',
          'batch://scene_images',
          { scene_images }
        );

        if (input.generation_id) {
          await this.jobService.updateGenerationSceneImages(
            input.generation_id,
            scene_images
          );
        }

        await this.jobService.updateStep(imageStep.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
        await this.jobService.updateJob(jobId, { progress: 50 });
      } catch (err: any) {
        await this.jobService.updateStep(imageStep.id, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: err?.message ?? String(err),
        });
        throw err;
      }

      // Wizard: parar após image_generation?
      if (stopAfterIndex !== undefined && stopAfterIndex <= 1) {
        await this.jobService.updateJob(jobId, { status: 'completed', progress: 100 });
        return;
      }

      // STEP 3 — audio_generation
      const audioStep = await this.jobService.createStep(jobId, 'audio_generation');
      let scene_audios: GeneratedSceneAudio[] = [];
      try {
        await this.jobService.updateStep(audioStep.id, {
          status: 'running',
          started_at: new Date().toISOString(),
        });

        const groups = input.scene_blueprints ?? [];
        const sceneTexts = input.scene_texts ?? null;
        const audioInputs: SceneAudioInput[] = [];
        for (const g of groups) {
          for (const s of g.scenes) {
            audioInputs.push({
              objectId: g.objectId,
              sceneId: s.sceneId,
              sceneType: s.sceneType,
              text: resolveSceneText(s, sceneTexts),
            });
          }
        }

        scene_audios = await generateSceneAudios(audioInputs);

        for (const a of scene_audios) {
          await this.jobService.addArtifact(jobId, 'scene_audio', a.audioUrl, {
            objectId: a.objectId,
            sceneId: a.sceneId,
            sceneType: a.sceneType,
            provider: a.provider,
            durationMs: a.durationMs,
            generatedAt: a.generatedAt,
          });
        }

        if (input.generation_id) {
          await this.jobService.updateGenerationSceneAudios(
            input.generation_id,
            scene_audios
          );
        }

        await this.jobService.updateStep(audioStep.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
        await this.jobService.updateJob(jobId, { progress: 80 });
      } catch (err: any) {
        await this.jobService.updateStep(audioStep.id, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: err?.message ?? String(err),
        });
        throw err;
      }

      // STEP 4 — timeline_build
      let timeline: VideoTimeline = { totalDurationMs: 0, scenes: [] };
      const timelineStep = await this.jobService.createStep(jobId, 'timeline_build');
      try {
        await this.jobService.updateStep(timelineStep.id, {
          status: 'running',
          started_at: new Date().toISOString(),
        });

        timeline = buildVideoTimeline({
          sceneBlueprints: input.scene_blueprints ?? [],
          sceneImages: scene_images.map((i) => ({
            sceneId: i.sceneId,
            imageUrl: i.imageUrl,
          })),
          sceneAudios: scene_audios.map((a) => ({
            sceneId: a.sceneId,
            audioUrl: a.audioUrl,
            durationMs: a.durationMs,
          })),
        });

        if (input.generation_id) {
          await this.jobService.updateGenerationVideoTimeline(
            input.generation_id,
            timeline
          );
        }

        await this.jobService.addArtifact(
          jobId,
          'video_timeline',
          'batch://video_timeline',
          { timeline }
        );

        await this.jobService.updateStep(timelineStep.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
        await this.jobService.updateJob(jobId, { progress: 90 });
      } catch (err: any) {
        await this.jobService.updateStep(timelineStep.id, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: err?.message ?? String(err),
        });
        throw err;
      }

      // STEP 5 — video_render
      const renderStep = await this.jobService.createStep(jobId, 'video_render');
      try {
        await this.jobService.updateStep(renderStep.id, {
          status: 'running',
          started_at: new Date().toISOString(),
        });

        const assembly = buildVideoAssembly({
          generationId: input.generation_id ?? jobId,
          timeline,
        });

        const rendered = await renderVideo({
          generationId: assembly.generationId,
          timeline: assembly,
        });

        await this.jobService.addArtifact(
          jobId,
          'rendered_video',
          rendered.videoUrl,
          {
            provider: rendered.provider,
            renderedAt: rendered.renderedAt,
            totalDurationMs: rendered.totalDurationMs,
          }
        );

        if (input.generation_id) {
          await this.jobService.updateGenerationVideoOutput(
            input.generation_id,
            rendered.videoUrl,
            assembly,
            rendered.sceneVideos,
          );
        }

        await this.jobService.updateStep(renderStep.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
        });
      } catch (err: any) {
        await this.jobService.updateStep(renderStep.id, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: err?.message ?? String(err),
        });
        throw err;
      }

      await this.jobService.updateJob(jobId, { status: 'completed', progress: 100 });
    } catch (err: any) {
      const errMsg = err?.message ?? String(err);
      await this.jobService
        .updateJob(jobId, { status: 'failed', error: errMsg })
        .catch(() => {});
      console.error(`[JobOrchestrator] job ${jobId} failed:`, err);
      // Propagar para a rota chamadora decidir como responder ao cliente.
      // Antes: erro era silenciado e rota retornava 200 OK com job_status="failed",
      // fazendo o wizard avançar para steps sem dados.
      throw err;
    }
  }
}
