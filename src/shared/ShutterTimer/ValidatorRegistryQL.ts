import { gql } from '@apollo/client';

export const GET_UPDATES = gql`
    query GetUpdates($first: Int!, $skip: Int!) {
        updateds(first: $first, skip: $skip, orderBy: blockNumber, orderDirection: asc) {
            id
            message
            signature
            blockNumber
        }
    }
`;
