import { useQuery } from '@tanstack/react-query'
import { contactApi } from '../api/contactApi'

export const useContacts = (accountId) => {
  return useQuery({
    queryKey: ['contacts', accountId],
    queryFn: () => contactApi.getContacts({ accountId }),
    enabled: !!accountId
  })
}
