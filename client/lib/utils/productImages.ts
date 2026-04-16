const PRODUCT_IMAGE_MAP: Record<string, string[]> = {
  "organic-bananas": [
    "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=1200&q=80",
  ],
  "gala-apples": [
    "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=1200&q=80",
  ],
  "whole-milk": [
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=1200&q=80",
  ],
  "organic-eggs": [
    "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=1200&q=80",
  ],
  "sourdough-bread": [
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1200&q=80",
  ],
};

export function getProductImageUrls(slug: string, name: string): string[] {
  if (PRODUCT_IMAGE_MAP[slug]) {
    return PRODUCT_IMAGE_MAP[slug];
  }

  const encodedName = encodeURIComponent(name);
  return [
    `https://source.unsplash.com/1200x900/?${encodedName},food`,
    `https://source.unsplash.com/1200x900/?${encodedName},grocery`,
    `https://source.unsplash.com/1200x900/?${encodedName},fresh`,
  ];
}
