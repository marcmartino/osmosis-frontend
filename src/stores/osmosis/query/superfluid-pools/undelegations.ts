import { KVStore } from '@keplr-wallet/common';
import { ChainGetter, ObservableChainQuery, ObservableChainQueryMap } from '@keplr-wallet/stores';
import {
	SuperfluidUndelegation,
	SuperfluidUndelegationRecordsResponse,
	SuperfluidUndelegationsResponse,
} from './types';
import { makeObservable } from 'mobx';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { Currency } from '@keplr-wallet/types';
import { computedFn } from 'mobx-utils';
import dayjs from 'dayjs';

export class ObservableQuerySuperfluidUndelegationsInner extends ObservableChainQuery<SuperfluidUndelegationsResponse> {
	constructor(
		kvStore: KVStore,
		chainId: string,
		chainGetter: ChainGetter,
		protected readonly delegatorBech32Address: string
	) {
		super(
			kvStore,
			chainId,
			chainGetter,
			`/osmosis/superfluid/v1beta1/superfluid_undelegations_by_delegator/${delegatorBech32Address}`
		);

		makeObservable(this);
	}

	protected canFetch(): boolean {
		return this.delegatorBech32Address !== '';
	}

	readonly getUndelegations = computedFn((poolShareCurrency: Currency): SuperfluidUndelegation[] | undefined => {
		if (!this.response) {
			return undefined;
		}

		const superfluidUndelegationRecords = this.response.data.superfluid_delegation_records;
		const superfluidUndelegationLocks = this.response.data.synthetic_locks;

		// synthetic_locks does not exist in v7.0.2 node due to a mistake. In this case, processing cannot be performed.
		if (!superfluidUndelegationLocks) {
			console.log("there is no synthetic_locks from response. check your node's version");
			return undefined;
		}

		if (superfluidUndelegationRecords.length !== superfluidUndelegationLocks.length) {
			throw new Error('Undelegation records and locks are different.');
		}

		return superfluidUndelegationRecords
			.filter(record => record.delegation_amount.denom === poolShareCurrency.coinMinimalDenom)
			.map((record, index) => ({
				delegator_address: record.delegator_address,
				validator_address: record.validator_address,
				amount: new CoinPretty(poolShareCurrency, new Dec(record.delegation_amount.amount)),
				duration: dayjs.duration(parseInt(superfluidUndelegationLocks[index].duration.replace('s', '')) * 1000),
				end_time: new Date(superfluidUndelegationLocks[index].end_time),
				lock_id: superfluidUndelegationLocks[index].underlying_lock_id,
			}));
	});
}

export class ObservableQuerySuperfluidUndelegations extends ObservableChainQueryMap<SuperfluidUndelegationsResponse> {
	constructor(
		protected readonly kvStore: KVStore,
		protected readonly chainId: string,
		protected readonly chainGetter: ChainGetter
	) {
		super(kvStore, chainId, chainGetter, delegatorBech32Address => {
			return new ObservableQuerySuperfluidUndelegationsInner(
				this.kvStore,
				this.chainId,
				this.chainGetter,
				delegatorBech32Address
			);
		});
	}

	getQuerySuperfluidDelegations(delegatorBech32Address: string): ObservableQuerySuperfluidUndelegationsInner {
		return this.get(delegatorBech32Address) as ObservableQuerySuperfluidUndelegationsInner;
	}
}
