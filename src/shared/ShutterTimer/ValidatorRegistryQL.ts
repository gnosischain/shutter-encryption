import { gql } from '@apollo/client';

export const GET_UPDATES = gql`
    query GetUpdates($first: Int!, $skip: Int!, $lastBlockNumber: Int!) {
        updateds(first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc, where: { blockNumber_gt: $lastBlockNumber }) {
            id
            message
            signature
            blockNumber
        }
    }
`;
