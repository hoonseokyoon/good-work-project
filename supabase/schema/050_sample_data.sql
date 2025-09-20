-- Sample data for Good Work project
-- This file contains sample data for testing and development

-- Clear existing data (for fresh import)
-- Comment out these lines if you want to preserve existing data
-- DELETE FROM public.news;
-- DELETE FROM public.events;
-- DELETE FROM public.products;
-- DELETE FROM public.institutions;

-- Sample institutions (기관/단체)
INSERT INTO public.institutions (name, slug, description, type, "order", lat, lng, address, phone, email, website_url, donation) VALUES
('서울사회복지공동모금회', 'seoul-community-chest', '서울지역의 사회복지 증진을 위해 모금 및 배분 활동을 하는 기관입니다.', '사회복지', 1, 37.5665, 126.9780, '서울특별시 중구 세종대로 110', '02-2204-2204', 'info@chest.or.kr', 'https://www.chest.or.kr', '{"bank": "국민은행", "account": "123-45-678910", "holder": "서울사회복지공동모금회"}'),
('굿네이버스', 'good-neighbors', '국제구호개발 NGO로 전 세계 어려운 이웃들을 돕는 단체입니다.', '국제구호', 2, 37.5423, 127.0701, '서울특별시 강남구 봉은사로 114길 10', '02-6717-4000', 'gnkorea@goodneighbors.kr', 'https://www.goodneighbors.kr', '{"bank": "우리은행", "account": "987-65-432110", "holder": "굿네이버스"}'),
('세이브더칠드런', 'save-the-children', '전 세계 아동의 권리 보호와 구호에 힘쓰는 국제NGO입니다.', '아동복지', 3, 37.5172, 127.0473, '서울특별시 중구 퇴계로 36길 2', '02-6900-4400', 'sc.korea@savethechildren.or.kr', 'https://www.sc.or.kr', '{"bank": "신한은행", "account": "456-78-901234", "holder": "세이브더칠드런"}'),
('대한적십자사', 'korean-red-cross', '인도주의 정신으로 재해구호, 의료봉사, 국제구호 활동을 펼치는 기관입니다.', '인도주의', 4, 37.5598, 126.9783, '서울특별시 중구 남대문로 108', '02-3705-3705', 'webmaster@redcross.or.kr', 'https://www.redcross.or.kr', '{"bank": "하나은행", "account": "789-01-234567", "holder": "대한적십자사"}'),
('환경운동연합', 'kfem', '자연과 인간이 공존하는 지속가능한 사회를 위해 활동하는 환경단체입니다.', '환경보호', 5, 37.5394, 126.9560, '서울특별시 종로구 필운대로 23', '02-735-7000', 'web@kfem.or.kr', 'https://www.kfem.or.kr', '{"bank": "기업은행", "account": "234-56-789012", "holder": "환경운동연합"}');

-- Sample products (제품)
INSERT INTO public.products (institution_id, name, category, unit, price, image_url, buy_url) VALUES
(1, '사랑의 쌀', '식료품', '10kg', 25000, 'https://example.com/images/rice.jpg', 'https://chest.or.kr/donate/rice'),
(1, '따뜻한 담요', '생활용품', '개', 35000, 'https://example.com/images/blanket.jpg', 'https://chest.or.kr/donate/blanket'),
(2, '아프리카 아동 급식 지원', '후원상품', '개월', 30000, 'https://example.com/images/africa-meal.jpg', 'https://goodneighbors.kr/support/africa'),
(2, '국내 아동 교육 키트', '교육용품', '세트', 50000, 'https://example.com/images/education-kit.jpg', 'https://goodneighbors.kr/support/education'),
(3, '신생아 생존 키트', '의료용품', '세트', 45000, 'https://example.com/images/newborn-kit.jpg', 'https://sc.or.kr/donate/newborn'),
(3, '아동 도서 지원', '도서', '권', 15000, 'https://example.com/images/children-book.jpg', 'https://sc.or.kr/donate/books'),
(4, '응급처치 키트', '의료용품', '세트', 28000, 'https://example.com/images/first-aid.jpg', 'https://redcross.or.kr/shop/first-aid'),
(4, '헌혈 기념품', '기념품', '개', 5000, 'https://example.com/images/blood-gift.jpg', 'https://redcross.or.kr/shop/gift'),
(5, '친환경 텀블러', '생활용품', '개', 18000, 'https://example.com/images/eco-tumbler.jpg', 'https://kfem.or.kr/shop/tumbler'),
(5, '재생지 노트', '문구용품', '권', 8000, 'https://example.com/images/recycle-note.jpg', 'https://kfem.or.kr/shop/notebook');

-- Sample events (이벤트)
INSERT INTO public.events (institution_id, title, description, start_at, end_at, signup_url) VALUES
(1, '2024 사랑의 김치 나눔 행사', '연말을 맞아 어려운 이웃들에게 김치를 나누는 봉사활동입니다.', '2024-12-15 09:00:00+09', '2024-12-15 17:00:00+09', 'https://chest.or.kr/events/kimchi2024'),
(1, '신년 후원자 감사 행사', '2024년 한 해 동안 후원해주신 분들을 위한 감사 행사입니다.', '2025-01-20 14:00:00+09', '2025-01-20 18:00:00+09', 'https://chest.or.kr/events/thanks2025'),
(2, '아프리카 우물 파기 프로젝트 설명회', '아프리카 지역 식수 문제 해결을 위한 우물 파기 프로젝트에 대한 설명회입니다.', '2024-11-25 19:00:00+09', '2024-11-25 21:00:00+09', 'https://goodneighbors.kr/events/well-project'),
(3, '아동 권리의 날 기념 캠페인', '11월 20일 아동 권리의 날을 기념하여 아동 권리 보호 캠페인을 진행합니다.', '2024-11-20 10:00:00+09', '2024-11-20 16:00:00+09', 'https://sc.or.kr/events/children-rights'),
(4, '응급처치 교육 워크샵', '일반인을 위한 기본 응급처치 교육 워크샵입니다.', '2024-12-08 13:00:00+09', '2024-12-08 17:00:00+09', 'https://redcross.or.kr/events/first-aid-workshop'),
(4, '헌혈 캠페인 "생명나눔"', '연말 혈액 부족 해결을 위한 헌혈 캠페인입니다.', '2024-12-20 09:00:00+09', '2024-12-22 18:00:00+09', 'https://redcross.or.kr/events/blood-donation'),
(5, '기후변화 대응 시민 토론회', '기후변화 문제에 대한 시민들의 의견을 나누는 토론회입니다.', '2024-11-30 15:00:00+09', '2024-11-30 18:00:00+09', 'https://kfem.or.kr/events/climate-forum'),
(5, '플라스틱 프리 챌린지 발대식', '일회용 플라스틱 줄이기 운동의 시작을 알리는 발대식입니다.', '2025-01-15 11:00:00+09', '2025-01-15 13:00:00+09', 'https://kfem.or.kr/events/plastic-free');

-- Sample news (뉴스)
INSERT INTO public.news (title, image_url, published_at, source_name, source_url, tags, institution_id, summary) VALUES
('서울시, 독거노인 지원 예산 30% 증액', 'https://example.com/news/elderly-support.jpg', '2024-11-15 09:30:00+09', '연합뉴스', 'https://yna.co.kr/view/AKR20241115000100051', '{사회복지,독거노인,서울시,예산}', 1, '서울시가 2025년 독거노인 지원 예산을 전년 대비 30% 증액한다고 발표했습니다.'),
('코로나19 이후 아동 교육 격차 심화', 'https://example.com/news/education-gap.jpg', '2024-11-14 14:20:00+09', 'KBS뉴스', 'https://news.kbs.co.kr/news/view.do?ncd=7826194', '{교육,코로나19,아동,격차}', 2, '코로나19 팬데믹 이후 국내 아동들 사이의 교육 격차가 더욱 심화되고 있다는 연구 결과가 발표되었습니다.'),
('글로벌 아동 기아 문제, 작년 대비 15% 증가', 'https://example.com/news/child-hunger.jpg', '2024-11-13 16:45:00+09', 'MBC뉴스', 'https://imnews.imbc.com/replay/2024/11/13/6536975_36207.html', '{기아,아동,글로벌,통계}', 3, '유엔 보고서에 따르면 전 세계 아동 기아 문제가 작년 대비 15% 증가한 것으로 나타났습니다.'),
('겨울철 헌혈 참여 저조, 혈액 부족 심각', 'https://example.com/news/blood-shortage.jpg', '2024-11-12 11:15:00+09', 'SBS뉴스', 'https://news.sbs.co.kr/news/endPage.do?news_id=N1007563202', '{헌혈,혈액부족,겨울,의료}', 4, '겨울철 헌혈 참여율 저하로 전국적으로 혈액 부족 현상이 심각한 수준에 달했습니다.'),
('미세먼지 저감을 위한 시민 참여 확대', 'https://example.com/news/fine-dust.jpg', '2024-11-11 13:25:00+09', 'JTBC뉴스', 'https://news.jtbc.co.kr/article/article.aspx?newsid=NB12124793', '{미세먼지,환경,시민참여,대기질}', 5, '미세먼지 문제 해결을 위한 시민 참여 프로그램이 전국적으로 확대되고 있습니다.'),
('사회복지사 처우 개선 방안 논의', 'https://example.com/news/social-worker.jpg', '2024-11-10 10:40:00+09', 'YTN뉴스', 'https://ytn.co.kr/news/202411101040', '{사회복지사,처우개선,정책,복지}', 1, '사회복지사들의 열악한 근무환경과 처우 개선을 위한 정책 방안이 논의되고 있습니다.'),
('국경없는의사회, 아프리카 의료 지원 확대', 'https://example.com/news/medical-aid.jpg', '2024-11-09 15:50:00+09', 'EBS뉴스', 'https://news.ebs.co.kr/ebsnews/allView/60424973', '{의료지원,아프리카,국제구호,NGO}', 2, '국경없는의사회가 아프리카 지역에 대한 의료 지원을 대폭 확대한다고 발표했습니다.'),
('기후변화 대응, 국제 협력 강화 필요', 'https://example.com/news/climate-change.jpg', '2024-11-08 12:30:00+09', 'TV조선', 'https://news.tvchosun.com/site/data/html_dir/2024/11/08/2024110890123.html', '{기후변화,국제협력,환경,정책}', 5, 'COP29를 앞두고 기후변화 대응을 위한 국제 협력 강화의 필요성이 대두되고 있습니다.');

-- Verify the inserted data
SELECT 'Institutions' as table_name, count(*) as count FROM public.institutions
UNION ALL
SELECT 'Products' as table_name, count(*) as count FROM public.products  
UNION ALL
SELECT 'Events' as table_name, count(*) as count FROM public.events
UNION ALL
SELECT 'News' as table_name, count(*) as count FROM public.news;
