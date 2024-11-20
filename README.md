# File JSON Converter

A Node.js service that converts various file types (PDF, DOCX, etc.) to structured JSON format using the Unstructured.io API. This service accepts a public URL of a file, processes it through Unstructured.io, and returns structured JSON data.

## Features

- 📄 Supports multiple file formats (PDF, DOCX, etc.)
- 🔄 Processes files from public URLs
- ⚡ Fast and efficient file handling
- 🔒 Secure environment variable configuration
- 🚀 Ready for deployment on Railway

## Prerequisites

Before you begin, ensure you have:
- Node.js >= 14.0.0
- npm (comes with Node.js)
- An Unstructured.io API key (get one at [unstructured.io](https://unstructured.io))

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/file-json-converter-v1.git
   cd file-json-converter-v1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file for local development:
   ```env
   PORT=3000
   UNSTRUCTURED_API_URL=https://api.unstructuredapp.io/general/v0/general
   UNSTRUCTURED_API_KEY=your-api-key-here
   ```

## Usage

### Starting the Server

For development (with hot reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

### API Endpoint

#### POST /process-file

Convert a file to JSON format.

**Request Body:**
```json
{
  "fileUrl": "https://example.com/path/to/your/file.pdf"
}
```

**Headers:**
```
Content-Type: application/json
```

**Response:**
- 200: Successful conversion (returns structured JSON data)
- 400: Invalid or missing fileUrl
- 413: File too large (>10MB)
- 500: Internal server error
- 502: External service error
- 504: Request timeout

### Example Using cURL

```bash
curl -X POST http://localhost:3000/process-file \
  -H "Content-Type: application/json" \
  -d '{"fileUrl": "https://example.com/document.pdf"}'
```

### Example Using Postman

1. Create a new POST request to `http://localhost:3000/process-file`
2. Set header `Content-Type: application/json`
3. Set body (raw, JSON):
   ```json
   {
     "fileUrl": "https://example.com/document.pdf"
   }
   ```

## Deployment

### Deploying to Railway

1. Fork this repository to your GitHub account
2. Create a new project in [Railway](https://railway.app)
3. Connect your GitHub repository
4. Add the following environment variables in Railway:
   - `NODE_ENV=production`
   - `UNSTRUCTURED_API_KEY=your-api-key`
   - `UNSTRUCTURED_API_URL=https://api.unstructuredapp.io/general/v0/general`

Railway will automatically:
- Detect the Node.js environment
- Install dependencies
- Start the server using the `npm start` command

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port (default: 3000) | No |
| UNSTRUCTURED_API_KEY | Your Unstructured.io API key | Yes |
| UNSTRUCTURED_API_URL | Unstructured.io API endpoint | Yes |
| NODE_ENV | Environment (development/production) | No |

## Error Handling

The service includes comprehensive error handling:
- Input validation for file URLs
- File size limits (10MB max)
- Timeouts (5s for download, 30s for processing)
- Automatic cleanup of temporary files
- Detailed error logging

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Unstructured.io](https://unstructured.io) for their excellent document processing API
- [Express.js](https://expressjs.com) for the web framework
- [Railway](https://railway.app) for deployment platform support
