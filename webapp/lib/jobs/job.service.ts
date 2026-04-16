import { createServiceClient } from '../supabase/server';

export class JobService {
  private supabase = createServiceClient();

  async createJob(data: Record<string, unknown>) {
    const { data: job, error } = await this.supabase
      .from('generation_jobs')
      .insert(data)
      .select()
      .single();

    if (error || !job) {
      throw new Error(`createJob failed: ${error?.message ?? 'no row returned'}`);
    }
    return job;
  }

  async updateJob(jobId: string, updates: Record<string, unknown>) {
    const { error } = await this.supabase
      .from('generation_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) {
      throw new Error(`updateJob(${jobId}) failed: ${error.message}`);
    }
  }

  async createStep(jobId: string, step: string) {
    const { data, error } = await this.supabase
      .from('generation_job_steps')
      .insert({
        job_id: jobId,
        step,
        status: 'pending'
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`createStep failed: ${error?.message ?? 'no row returned'}`);
    }
    return data;
  }

  async updateStep(stepId: string, updates: Record<string, unknown>) {
    const { error } = await this.supabase
      .from('generation_job_steps')
      .update(updates)
      .eq('id', stepId);

    if (error) {
      throw new Error(`updateStep(${stepId}) failed: ${error.message}`);
    }
  }

  async getJob(jobId: string) {
    const { data, error } = await this.supabase
      .from('generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      throw new Error(`getJob(${jobId}) failed: ${error.message}`);
    }
    return data;
  }

  async updateGenerationSceneImages(
    generationId: string,
    sceneImages: unknown
  ) {
    const { error } = await this.supabase
      .from('generations')
      .update({ scene_images: sceneImages })
      .eq('id', generationId);

    if (error) {
      throw new Error(
        `Failed to update generation scene_images: ${error.message}`
      );
    }
  }

  async updateGenerationSceneAudios(
    generationId: string,
    sceneAudios: unknown
  ) {
    const { error } = await this.supabase
      .from('generations')
      .update({ scene_audios: sceneAudios })
      .eq('id', generationId);

    if (error) {
      throw new Error(
        `Failed to update generation scene_audios: ${error.message}`
      );
    }
  }

  async updateGenerationVideoTimeline(
    generationId: string,
    videoTimeline: unknown
  ) {
    const { error } = await this.supabase
      .from('generations')
      .update({ video_timeline: videoTimeline })
      .eq('id', generationId);

    if (error) {
      throw new Error(
        `Failed to update generation video_timeline: ${error.message}`
      );
    }
  }

  async updateGenerationVideoOutput(
    generationId: string,
    videoUrl: string,
    videoAssembly: unknown
  ) {
    const { error } = await this.supabase
      .from('generations')
      .update({ video_url: videoUrl, video_assembly: videoAssembly })
      .eq('id', generationId);

    if (error) {
      throw new Error(
        `Failed to update generation video output: ${error.message}`
      );
    }
  }

  async getGeneration(generationId: string) {
    const { data, error } = await this.supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .single();
    if (error) {
      throw new Error(`Failed to read generation ${generationId}: ${error.message}`);
    }
    return data;
  }

  async addArtifact(jobId: string, type: string, url: string, metadata: Record<string, unknown> = {}) {
    const { error } = await this.supabase
      .from('generation_artifacts')
      .insert({
        job_id: jobId,
        type,
        url,
        metadata
      });

    if (error) {
      throw new Error(`addArtifact(${jobId}, ${type}) failed: ${error.message}`);
    }
  }
}
