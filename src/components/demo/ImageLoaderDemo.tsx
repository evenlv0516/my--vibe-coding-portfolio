import ImageLoader from "@/src/components/ui/image-loading";

export default function DemoOne() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
          <ImageLoader
            src="https://res.cloudinary.com/dctgknnt7/image/upload/v1758636339/middle_vqdg9p.jpg"
            alt="Mountain landscape"
            width="500px"
            height="630px"
            gridSize={15}
            cellGap={15}
            cellShape="square"
            cellColor="#cbd5e1"
            blinkSpeed={2000}
            transitionDuration={500}
            fadeOutDuration={600}
            loadingDelay={3500}
            className="rounded-lg overflow-hidden"
          />
    </div>
  )
}
