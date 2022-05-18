export enum DashboardContract {
  FounderNft,
  FounderVaultV1,
  FounderVaultV2,
  AtlasMine,
  Magic,
  SpecialNFTRouter,
  UnknowPool,
}

export type ContractMap = Record<DashboardContract, any>;

export type ContractError = Error & {
  data?: {
    code?: number;
    message?: string;
  };
};
