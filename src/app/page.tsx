import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="w-full max-w-3xl rounded-2xl border bg-card p-8 text-center md:p-12">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Smart Laptop Store
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Mua laptop chính hãng, giá tốt, hỗ trợ kỹ thuật tận tâm
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Duyệt danh sách sản phẩm mới nhất và xem chi tiết cấu hình, giá bán,
          thương hiệu ngay trên website.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Xem sản phẩm
          </Link>
          <Link
            href="/pc-build"
            className="inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium hover:bg-muted"
          >
            PC Builder
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium hover:bg-muted"
          >
            Đăng nhập
          </Link>
        </div>
      </section>
    </main>
  );
}
