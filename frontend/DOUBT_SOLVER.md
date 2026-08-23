# Doubt Solver frontend integration

The frontend now calls the real backend endpoint directly:

`POST ${VITE_API_URL}/doubts/solve`

Default API base:

`http://localhost:5000/api`

The request is `multipart/form-data` with `subject`, `question`, and optional `file`.

Do not set the multipart Content-Type header manually; the browser/Axios adds the required boundary.
