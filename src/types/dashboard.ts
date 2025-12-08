import { Machine, Job } from "@prisma/client";

export type MachineWithJobs = Machine & {
	jobs: Pick<Job, "cycleCount" | "productSize">[];
};