# Step 1: Build the Go binary
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum files first to cache dependencies
COPY go.mod go.sum* ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Step 2: Run the binary
FROM alpine:latest  
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the compiled binary from the builder stage
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]