import { z } from "zod";

import { PASSWORD_REQUIREMENTS } from "@/lib/password";
import { TASK_STATUSES } from "@/lib/types";

const email = z.string().trim().email("Enter a valid email address").toLowerCase();
const password = z.string().superRefine((value, context) => {
  const failedRequirement = PASSWORD_REQUIREMENTS.find(
    (requirement) => !requirement.test(value),
  );

  if (failedRequirement) {
    context.addIssue({
      code: "custom",
      message: `Password must include: ${failedRequirement.label.toLowerCase()}`,
    });
  }
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(72),
});

const taskFields = {
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().trim().max(1000, "Description must be 1,000 characters or fewer"),
  status: z.enum(TASK_STATUSES),
};

export const createTaskSchema = z.object({
  title: taskFields.title,
  description: taskFields.description.default(""),
  status: taskFields.status.default("todo"),
});

export const updateTaskSchema = z.object(taskFields).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update",
);
