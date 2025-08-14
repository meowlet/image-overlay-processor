# Image Overlay Processor

TypeScript xử lý ảnh hàng loạt với overlay tự động theo orientation. Tự động phát hiện hướng ảnh và áp dụng overlay phù hợp.

## Tính năng

- **Orientation Detection**: Tự động phát hiện ảnh ngang/dọc
- **Overlay Application**: Sử dụng overlay khác nhau cho ảnh ngang và dọc
- **Scaling**: Giữ tỷ lệ ảnh với width percentage có thể cấu hình
- **EXIF Rotation Handling**: Xử lý đúng metadata xoay ảnh
- **High Performance**: Xây dựng với Sharp để xử lý ảnh nhanh
- **Batch Processing**: Xử lý toàn bộ thư mục ảnh
- **Format Support**: Hỗ trợ JPG, JPEG, PNG, BMP, TIFF, WEBP
- **Configurable**: Có thể tùy chỉnh đường dẫn input/output và overlay settings

## Cài đặt

```bash
# Clone repository
git clone https://github.com/meowlet/image-overlay-processor.git
cd image-overlay-processor

# Cài đặt dependencies
bun install
```

## Sử dụng

### Basic

1. **Chuẩn bị file**:

   - Đặt ảnh cần xử lý vào thư mục `input/`
   - Đảm bảo có file overlay: `overlay-horizontal.png` và `overlay-vertical.png`

2. **Chạy processor**:

   ```bash
   bun start
   ```

3. **Kiểm tra kết quả**: Ảnh đã xử lý sẽ được lưu trong thư mục `output/`

### Advanced

```bash
# Custom configuration
bun start [input_dir] [horizontal_overlay] [vertical_overlay] [output_dir]

# Ví dụ
bun start ./my-images ./overlays/h-overlay.png ./overlays/v-overlay.png ./processed
```

## Configuration

### Mặc định

| Setting            | Giá trị                    | Mô tả                               |
| ------------------ | -------------------------- | ----------------------------------- |
| Input Directory    | `./input`                  | Vị trí ảnh nguồn                    |
| Horizontal Overlay | `./overlay-horizontal.png` | Overlay cho ảnh ngang               |
| Vertical Overlay   | `./overlay-vertical.png`   | Overlay cho ảnh dọc                 |
| Output Directory   | `./output`                 | Thư mục lưu ảnh đã xử lý            |
| Horizontal Width % | `82%`                      | Width ảnh so với canvas (landscape) |
| Vertical Width %   | `79%`                      | Width ảnh so với canvas (portrait)  |

### Tùy chỉnh Configuration

Sửa đổi cấu hình mặc định trong `src/config/index.ts`:

```typescript
export const defaultConfig: ProcessingConfig = {
  inputDir: "./input",
  horizontalOverlayPath: "./overlay-horizontal.png",
  verticalOverlayPath: "./overlay-vertical.png",
  outputDir: "./output",
  horizontalWidthPercent: 82,
  verticalWidthPercent: 79,
};
```

## Cấu trúc Project

```
image-overlay-processor/
├── src/
│   ├── config/
│   │   └── index.ts              # Configuration management
│   ├── services/
│   │   ├── imageProcessor.ts     # Logic xử lý chính
│   │   └── overlayService.ts     # Xử lý overlay
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── utils/
│   │   ├── fileSystem.ts         # Thao tác file system
│   │   └── imageUtils.ts         # Utility functions cho ảnh
│   └── main.ts                   # Entry point của application
├── input/                        # Ảnh nguồn (tạo thư mục này)
├── output/                       # Ảnh đã xử lý (tự động tạo)
├── overlay-horizontal.png        # Overlay cho ảnh ngang
├── overlay-vertical.png          # Overlay cho ảnh dọc
└── package.json
```

## Development

### Available Scripts

```bash
# Development với hot reload
bun run dev

# Production build
bun run build

# Start application
bun start
```

### Build cho Production

```bash
bun run build
```

Tạo file executable standalone `image-overlay-processor.exe` với tất cả dependencies.
