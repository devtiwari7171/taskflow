import handler from 'serve-handler'
import http from 'http'

// Railway injects PORT automatically - we MUST use it
const PORT = parseInt(process.env.PORT) || 3000

console.log(`Starting server on PORT=${PORT}`)

const server = http.createServer((req, res) => {
  return handler(req, res, {
    public: 'dist',
    rewrites: [{ source: '**', destination: '/index.html' }]
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend running on http://0.0.0.0:${PORT}`)
})
