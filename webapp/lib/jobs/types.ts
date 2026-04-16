export type JobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed';

export type JobStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export type JobStepType =
  | 'ingest'
  | 'download'
  | 'frame_extraction'
  | 'reverse_engineering'
  | 'blueprint'
  | 'package_generation'
  | 'video_generation'
  | 'assembly'
  | 'delivery';

export interface GenerationJob {
  id: string;
  tenantId: string;
  userId: string;
  status: JobStatus;
  progress: number;
  input: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationJobStep {
  id: string;
  jobId: string;
  step: JobStepType;
  status: JobStepStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface GenerationArtifact {
  id: string;
  jobId: string;
  type: string;
  url: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
