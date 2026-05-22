import client from './client'
export const getProjects      = ()           => client.get('/projects')
export const getProject       = (id)         => client.get(`/projects/${id}`)
export const createProject    = (data)       => client.post('/projects', data)
export const updateProject    = (id, data)   => client.put(`/projects/${id}`, data)
export const deleteProject    = (id)         => client.delete(`/projects/${id}`)
export const addMember        = (pid, data)  => client.post(`/projects/${pid}/members`, data)
export const removeMember     = (pid, uid)   => client.delete(`/projects/${pid}/members/${uid}`)
export const updateMemberRole = (pid, uid, role) =>
  client.patch(`/projects/${pid}/members/${uid}`, { role })
