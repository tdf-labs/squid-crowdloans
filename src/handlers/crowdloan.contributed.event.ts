import { EventHandlerContext } from '@subsquid/substrate-processor';
import { Store } from "@subsquid/typeorm-store";
import {
  SubstrateCrowdloanContribution, SubstrateCrowdloanContributionAccount, SubstrateNetwork
} from '../model';
import {
  decodeAddress,
  encodeAddress, getOrCreate, getRegistry
} from '../utils';
import { getContributedEvent } from './typeGetters/getContributedEvent';

export default (network: SubstrateNetwork, tokenIndex: number) =>
  async (ctx: EventHandlerContext<Store>) => {
    const blockNumber = BigInt(ctx.block.height);
    const date = new Date(ctx.block.timestamp);
    const symbol = getRegistry(network).symbols[tokenIndex];
    const decimals = getRegistry(network).decimals[tokenIndex];
    const {
      amount,
      fundIndex,
      who: rawAddress,
    } = getContributedEvent(ctx, network);

    const address = encodeAddress(network, rawAddress);
    const rootAccount = decodeAddress(rawAddress);

    const account = await getOrCreate(
      ctx.store,
      SubstrateCrowdloanContributionAccount,
      {
        id: address,
        rootAccount,
        network,
        totalCrowdloanContributions: 0,
      }
    );
    account.totalCrowdloanContributions =
      account.totalCrowdloanContributions + 1;
    await ctx.store.save(account);

    const contribution = new SubstrateCrowdloanContribution({
      id: `${blockNumber.toString()}:${ctx.event.indexInBlock}`,
      network,
      blockNumber,
      date,
      symbol,
      decimals,
      amount,
      paraId: fundIndex,
      account,
      rootAccount,
    });

    await ctx.store.save(contribution);
  };
