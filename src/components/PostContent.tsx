interface PostContentProps {
  html: string
}

export default function PostContent({ html }: PostContentProps) {
  return (
    <div
      className="post-content prose max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-normal prose-a:text-neutral-700 prose-a:underline prose-blockquote:border-l-neutral-400 prose-blockquote:text-gray-600 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md prose-table:text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
