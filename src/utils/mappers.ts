
export const mapChainToOption = (chainData: any) => {
  return {
    ...chainData,
    key: String(chainData.id),
    label: chainData.name,
    value: String(chainData.id),
    avatar: chainData.img,
  }
};

export const mapChainsToOptions = (chains: any) => chains.map(mapChainToOption);

export const mapTokenToOption = (token: any) => ({
  ...token,
  key: token.address,
  label: token.symbol,
  value: token.address,
  avatar: token.img,
});

export const mapTokensToOptions = (tokens: any) => tokens.map(mapTokenToOption);
