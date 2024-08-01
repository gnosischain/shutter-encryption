import { gql } from '@apollo/client';

export const GET_UPDATES = gql`
    query GetValidatorsIndex($first: Int!){
        ValidatorIndex(first: $first, orderBy: id, orderDirection: asc, where: {active: {_eq: true}}) {
            id
            active
        }
    }
`;