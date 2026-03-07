import { z } from "zod";

// Habit validation schema
export const habitSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  emoji: z.string().min(1, "Escolha um emoji"),
  category: z.enum(["health", "productivity", "spiritual", "financial", "selfcare"], {
    required_error: "Escolha uma categoria",
  }),
  reminderTime: z.string().optional(),
});

export type HabitFormData = z.infer<typeof habitSchema>;

// Transaction validation schema
export const transactionSchema = z.object({
  description: z
    .string()
    .min(2, "Descrição deve ter pelo menos 2 caracteres")
    .max(100, "Descrição deve ter no máximo 100 caracteres"),
  category: z.string().min(1, "Escolha uma categoria"),
  amount: z
    .number()
    .positive("Valor deve ser positivo")
    .max(1000000, "Valor máximo é R$ 1.000.000"),
  type: z.enum(["income", "expense"]),
  date: z.date(),
  recurring: z.boolean().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// Wish validation schema
export const wishSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  targetAmount: z
    .number()
    .positive("Valor deve ser positivo")
    .max(10000000, "Valor máximo é R$ 10.000.000"),
  deadline: z.date().optional(),
  emoji: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export type WishFormData = z.infer<typeof wishSchema>;

// User preferences validation
export const userPreferencesSchema = z.object({
  theme: z.enum(["dark", "light", "system"]),
  language: z.enum(["pt-BR", "en-US", "es"]),
  currency: z.enum(["BRL", "USD", "EUR"]),
  notifications: z.object({
    habits: z.boolean(),
    finances: z.boolean(),
    achievements: z.boolean(),
    streaks: z.boolean(),
    community: z.boolean(),
  }),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Helper function to safely validate data
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map((e) => e.message),
  };
};
