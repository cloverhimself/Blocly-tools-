export interface JwtDecoderInput {
  token: string;
}

export interface JwtDecoderOutput {
  header: string;
  payload: string;
}
