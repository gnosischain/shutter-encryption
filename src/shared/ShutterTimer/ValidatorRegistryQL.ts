import { gql } from '@apollo/client';

export const GET_UPDATES = gql`
  query GetValidatorsIndex {
    ValidatorIndex(where: {active: {_eq: true}}) {
      id
      active
    }
  }
`;