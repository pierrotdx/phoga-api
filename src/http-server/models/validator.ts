export type TValidatorData = Record<string, unknown>;

export interface IValidator {
  validate: (data: unknown) => void;
}
