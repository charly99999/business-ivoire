import { supabase } from "@/lib/supabase";

type ListingImageRow = {
  id: string;
  storage_path: string;
  sort_order: number;
};

type ListingRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price_fcfa: number | string;
  currency: "XOF";
  category: string;
  location: string;
  condition: "new" | "used" | "service";
  status: "active" | "sold" | "archived";
  created_at: string;
  listing_images?: ListingImageRow[] | null;
  profiles?: { display_name: string; location: string } | null;
};

export type MarketplaceListing = {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: "XOF";
  category: string;
  location: string;
  condition: "new" | "used" | "service";
  status: "active" | "sold" | "archived";
  createdAt: string;
  seller: { displayName: string; location: string };
  images: Array<{ id: string; url: string; sortOrder: number }>;
};

function listingImageUrl(storagePath: string) {
  return supabase.storage.from("listing-media").getPublicUrl(storagePath).data.publicUrl;
}

function mapListing(row: ListingRow): MarketplaceListing {
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description,
    price: Number(row.price_fcfa),
    currency: row.currency,
    category: row.category,
    location: row.location,
    condition: row.condition,
    status: row.status,
    createdAt: row.created_at,
    seller: {
      displayName: row.profiles?.display_name ?? "Vendeur Business Ivoire",
      location: row.profiles?.location ?? row.location,
    },
    images: (row.listing_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({ id: image.id, url: listingImageUrl(image.storage_path), sortOrder: image.sort_order })),
  };
}

const publicListingSelect = "id,seller_id,title,description,price_fcfa,currency,category,location,condition,status,created_at,profiles!listings_seller_id_fkey(display_name,location),listing_images(id,storage_path,sort_order)";

export async function fetchPublicListings(limit = 20, offset = 0): Promise<MarketplaceListing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(publicListingSelect)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return ((data ?? []) as unknown as ListingRow[]).map(mapListing);
}

export async function fetchPublicListing(id: string): Promise<MarketplaceListing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(publicListingSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapListing(data as unknown as ListingRow) : null;
}
