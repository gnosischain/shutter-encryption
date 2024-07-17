type ValidatorRegistryData = {
  lastBlock: number;
  messages: string[];
};

export async function loadCachedRegistryLogs(chainId: number, validatorRegistryStartBlockNumber: number): Promise<ValidatorRegistryData> {
  try {
    const { messages = [], lastBlock = validatorRegistryStartBlockNumber } = await import(`../data/${chainId}/validator.json`);
    return { messages, lastBlock };
  } catch (err) {
    console.error(err);
  }

  return {
    lastBlock: validatorRegistryStartBlockNumber,
    messages: [],
  };
}
