# Hotel API

This API allows you to retrieve hotel data based on hotel ID or destination ID.

## Getting Started

To get started with the API, follow the steps below.

### Prerequisites

- Node.js and npm installed on your machine
- MongoDB database

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/n-fadhilah/Hotel_Assignment/
   ```

2. Install the dependencies:

   ```
   cd project-folder
   npm install
   ```

3. Configure the MongoDB connection in `app/config/db.config.js`:

   ```javascript
   module.exports = {
     url: "mongodb://localhost:27017/hotels" // Replace with your MongoDB connection URL
   };
   ```

4. Start the server:

   ```
   npm start
   ```

   The server should start running on `http://localhost:8080`.

## Endpoints

### GET /api/hotels

Retrieves hotel data based on query parameters.

- Parameters:
  - `hotelid` (optional): Hotel ID to filter the results.
  - `destinationId` (optional): Destination ID to filter the results.

- Example Requests:
  - GET `/api/hotels?hotelid=SjyX`
  - GET `/api/hotels?destinationId=5432`

 
### Testing
To run the unit tests for the API, use the following command:

   ```
   npm test
   ```

### Error Handling

- If the hotel ID or destination ID is not found, the API will respond with an empty array.

## Caching

This API implements caching using the `node-cache` library to improve performance and reduce the load on external APIs. Cached data is stored in memory and is automatically updated based on a predefined expiration time or when new data is requested.
