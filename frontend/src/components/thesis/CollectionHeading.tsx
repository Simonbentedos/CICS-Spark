interface CollectionHeadingProps {
  title: string
  className?: string
}

export default function CollectionHeading({ title, className }: Readonly<CollectionHeadingProps>) {
  return (
    <h1 className={`font-body text-gray-600 text-[24px] leading-[29px] text-right uppercase max-w-[390px] ${className ?? ''}`}>
      {title}
    </h1>
  )
}
