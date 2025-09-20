export const institutions = [
  {
    id: 1,
    name: "서울 베네딕도 수도원",
    slug: "seoul-benedictine",
    type: "베네딕도회",
    lat: 37.5894,
    lng: 127.0076,
    address: "서울특별시 성북구 보문로34길 53",
    description: "도심 속에서 고요한 삶과 기도의 전통을 이어가는 베네딕도 수도원입니다.",
    donation: {
      account: "국민 123456-78-123456 수도원",
      page_url: "https://example.org/donate"
    },
    phone: "02-000-0000",
    email: "info@seoul-benedictine.kr",
    website_url: "https://example.org",
    order: 1
  },
  {
    id: 2,
    name: "대구 까르멜 수녀원",
    slug: "daegu-carmelite",
    type: "카르멜회",
    lat: 35.8714,
    lng: 128.6014,
    address: "대구광역시 남구 이천로 123",
    description: "은수생활 전통을 이어가는 까르멜 수녀들의 공동체입니다.",
    donation: {
      account: "대구은행 654321-00-000000",
      page_url: "https://example.org/carmelite-support"
    },
    phone: "053-111-2222",
    email: "contact@daegu-carmelite.kr",
    website_url: "https://example.org/carmelite",
    order: 2
  },
  {
    id: 3,
    name: "강릉 프란치스코 수도원",
    slug: "gangneung-franciscan",
    type: "프란치스코회",
    lat: 37.7519,
    lng: 128.8761,
    address: "강원특별자치도 강릉시 교항동 45-3",
    description: "강릉 바다를 품은 순례자들의 쉼터, 프란치스코 수도원입니다.",
    donation: {
      account: "신한 200-345-987654",
      page_url: "https://example.org/franciscan-donate"
    },
    phone: "033-555-1212",
    email: "hello@gangneung-franciscan.kr",
    website_url: "https://example.org/franciscan",
    order: 3
  }
]

export const products = [
  {
    id: 101,
    institution_id: 1,
    name: "허브 천연비누",
    category: "생활용품",
    unit: "1개",
    price: 12000,
    image_url: "https://images.unsplash.com/photo-1600180758890-6d7bb0dbdbb0",
    buy_url: "https://store.example.org/herb-soap"
  },
  {
    id: 102,
    institution_id: 2,
    name: "까르멜 묵주",
    category: "신앙용품",
    unit: "1세트",
    price: 18000,
    image_url: "https://images.unsplash.com/photo-1526401485004-46910ecc8e51",
    buy_url: "https://store.example.org/rosary"
  },
  {
    id: 103,
    institution_id: 3,
    name: "프란치스코 수제 잼",
    category: "식품",
    unit: "200g",
    price: 9000,
    image_url: "https://images.unsplash.com/photo-1560807707-8cc77767d783",
    buy_url: "https://store.example.org/jam"
  }
]

export const news = [
  {
    id: 201,
    title: "베네딕도 수도원, 도시농업 봉사활동 진행",
    published_at: "2024-03-15T09:00:00+09:00",
    source_name: "수도원 뉴스레터",
    source_url: "https://example.org/news/urban-farm",
    image_url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    tags: ["봉사", "도시농업"]
  },
  {
    id: 202,
    title: "까르멜 수녀원, 고요 워크숍 참가자 모집",
    published_at: "2024-04-02T10:00:00+09:00",
    source_name: "공동체 소식",
    source_url: "https://example.org/news/silent-retreat",
    image_url: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
    tags: ["피정", "워크숍"]
  },
  {
    id: 203,
    title: "프란치스코 수도원, 바닷길 순례 지도 공개",
    published_at: "2024-04-20T08:00:00+09:00",
    source_name: "프란치스칸 매거진",
    source_url: "https://example.org/news/pilgrimage",
    image_url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
    tags: ["순례", "여행"]
  }
]

export const events = [
  {
    id: 301,
    institution_id: 1,
    title: "봄 맞이 침묵피정",
    start_at: "2024-05-10T18:00:00+09:00",
    signup_url: "https://example.org/events/silent-retreat"
  },
  {
    id: 302,
    institution_id: 2,
    title: "마음돌봄 봉사자 교육",
    start_at: "2024-06-01T09:30:00+09:00",
    signup_url: "https://example.org/events/volunteer-training"
  },
  {
    id: 303,
    institution_id: 3,
    title: "프란치스코 순례길 걷기",
    start_at: "2024-07-05T07:00:00+09:00",
    signup_url: "https://example.org/events/pilgrimage"
  }
]
