# Image Overlay Processor

Ứng dụng TypeScript để overlay ảnh với file overlay PNG (có transparent) lên tất cả ảnh trong một thư mục.

## Tính năng

- Resize ảnh gốc về width 5192px (giữ nguyên tỷ lệ)
- Overlay ảnh PNG lên vị trí x=404, y=232
- Xử lý hàng loạt tất cả ảnh trong thư mục
- Hỗ trợ các định dạng: JPG, JPEG, PNG, BMP, TIFF, WEBP

## Cài đặt

```bash
bun install
```

## Cách sử dụng

### 1. Chuẩn bị

- Tạo thư mục `input` và đặt các ảnh cần xử lý vào đó
- Đặt file overlay PNG có tên `overlay.png` ở thư mục gốc
- Kết quả sẽ được lưu trong thư mục `output`

### 2. Chạy ứng dụng

#### Với cấu hình mặc định:

```bash
bun start
```

#### Với thư mục tùy chỉnh:

```bash
bun start [thư_mục_đầu_vào] [file_overlay] [thư_mục_đầu_ra]
```

Ví dụ:

```bash
bun start ./my-images ./my-overlay.png ./processed-images
```

## Cấu hình mặc định

- **Thư mục đầu vào**: `./input`
- **File overlay**: `./overlay.png`
- **Thư mục đầu ra**: `./output`
- **Vị trí overlay**: x=404, y=232
- **Chiều rộng mục tiêu**: 5192px

## Cấu trúc thư mục

```
image-processor/
├── input/           # Đặt ảnh gốc vào đây
│   ├── image1.jpg
│   ├── image2.png
│   └── ...
├── overlay.png      # File overlay (PNG với transparent)
├── output/          # Ảnh đã xử lý sẽ được lưu ở đây
├── index.ts         # File chính
└── package.json
```

## Yêu cầu hệ thống

- Bun runtime
- Node.js (để chạy Sharp)

## Dependencies

- **sharp**: Thư viện xử lý ảnh hiệu suất cao
- **@types/node**: Type definitions cho Node.js

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.15. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
