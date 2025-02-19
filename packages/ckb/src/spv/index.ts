import axios from 'axios';
import { SpvClientCellTxProofReq, SpvClientCellTxProofResponse } from '../types/spv';
import { SpvRpcError } from '../error';
import { append0x, toCamelcase, u32ToLe } from '../utils';
import { blockchain } from '@ckb-lumos/base';
import { Hex } from '../types';

export class SPVService {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  fetchSpvClientCellAndTxProof = async ({
    btcTxId,
    confirmBlocks,
  }: SpvClientCellTxProofReq): Promise<SpvClientCellTxProofResponse> => {
    let payload = {
      id: Math.floor(Math.random() * 100000),
      jsonrpc: '2.0',
      method: 'getTxProof',
      params: [btcTxId, confirmBlocks],
    };
    const body = JSON.stringify(payload, null, '  ');
    const response = await axios({
      method: 'post',
      url: this.url,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 20000,
      data: body,
    });
    const data = response.data;
    if (data.error) {
      console.error(data.error);
      throw new SpvRpcError('Fetch SPV client cell and tx proof error');
    } else {
      return toCamelcase(data.result);
    }
  };
}

export const buildSpvClientCellDep = (spvClient: Hex) => {
  const outPoint = blockchain.OutPoint.unpack(spvClient);
  const cellDep: CKBComponents.CellDep = {
    outPoint: {
      txHash: outPoint.txHash,
      index: append0x(u32ToLe(outPoint.index)),
    },
    depType: 'code',
  };
  return cellDep;
};
