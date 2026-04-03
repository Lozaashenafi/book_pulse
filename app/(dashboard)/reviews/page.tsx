// app/reviews/page.tsx (Server Component)
import { Metadata } from 'next';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { bookReviews } from '@/lib/db/schema';
import BookReviewsPage from '../../../components/review/BookReviewsPage'; // Import your client component

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // FIX: You must await searchParams in Next.js 15
  const { id } = await searchParams;

  if (!id) return { title: "Archive Registry | BookPulse" };

  const review = await db.query.bookReviews.findFirst({
    where: eq(bookReviews.id, id),
  });

  if (!review) return { title: "Review Not Found | BookPulse" };

  // Use your production domain for absolute image paths
  const domain = "https://bookpulse.lozi.me"; 
  const previewImage = review.imageUrl || `${domain}/og-default.png`;

  return {
    title: `Reflection on ${review.bookTitle}`,
    description: review.content.substring(0, 160) + "...",
    openGraph: {
      title: `${review.bookTitle} - BookPulse Reflection`,
      description: review.content.substring(0, 160),
      url: `${domain}/reviews?id=${id}`,
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: review.bookTitle,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: review.bookTitle,
      description: review.content.substring(0, 160),
      images: [previewImage],
    }
  };
}

export default function Page() {
  return <BookReviewsPage />;
}