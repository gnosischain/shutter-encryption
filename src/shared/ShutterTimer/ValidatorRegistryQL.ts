import { gql } from '@apollo/client';

export const GET_UPDATES = gql`
    query GetUpdates($first: Int!, $lastBlockNumber: Int!) {
        updateds(first: $first, orderBy: blockNumber, orderDirection: asc, where: { blockNumber_gte: $lastBlockNumber }) {
            id
            message
            signature
            blockNumber
        }
    }
`;
