import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import './App.css'
import { getSections } from './api'

function nl2br(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => (
    <span key={i}>{i > 0 && <br />}{line}</span>
  ))
}

function parseStat(value) {
  const m = value.match(/^([^\d]*)([\d,]+)([^\d]*)$/)
  if (!m) return { prefix: '', num: 0, suffix: '' }
  return { prefix: m[1], num: parseInt(m[2].replace(/,/g, '')), suffix: m[3] }
}

function AnimatedStat({ value, label }) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); obs.unobserve(el) }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const { num } = parseStat(value)
    const duration = 1200
    const startTime = performance.now()
    let raf
    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * num))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, value])

  const { prefix, suffix } = parseStat(value)
  const formatted = display.toLocaleString()

  return (
    <div className="content" ref={ref}>
      <h1 className="content-title">{prefix}{formatted}{suffix}</h1>
      <p className="content-text">{label}</p>
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(null)
  const [teamIdx, setTeamIdx] = useState(0)
  const trackRef = useRef(null)
  const [step, setStep] = useState(0)

  const D = data || {}
  const servicesItems = D.services?.items || [
    { name: 'المصرفية والمالية', image: '' },
    { name: 'الملكية الفكرية', image: '' },
    { name: 'قسمة التركات', image: '' },
    { name: 'الكيانات الحكومية', image: '' },
    { name: 'التعاملات التجارية', image: '' },
    { name: 'الاستشارات القانونية', image: '' },
    { name: 'التمثيل القضائي', image: '' },
    { name: 'تسوية المنازعات', image: '' },
  ]
  const teamMembers = D.teams?.members || [
    { name: 'أحمد السبيعي', title: 'محامٍ أول', image: '' },
    { name: 'خالد القحطاني', title: 'مستشار قانوني', image: '' },
    { name: 'نورة الشمري', title: 'محامية', image: '' },
    { name: 'سعود المطيري', title: 'محامٍ مشارك', image: '' },
    { name: 'فهد الدوسري', title: 'مستشار قانوني', image: '' },
    { name: 'عبدالله الزهراني', title: 'محامٍ', image: '' },
    { name: 'مها الغامدي', title: 'محامية', image: '' },
    { name: 'تركي العنزي', title: 'محامٍ مشارك', image: '' },
  ]
  const teamMax = Math.max(0, teamMembers.length - 4)
  const nextTeam = () => setTeamIdx(i => (i >= teamMax ? 0 : i + 1))
  const prevTeam = () => setTeamIdx(i => (i <= 0 ? teamMax : i - 1))

  const testimonialsData = D.testimonials || [
    { quote: 'تجربة ممتازة من البداية للنهاية، فريق محترف ومتعاون، وتم إنجاز كل الإجراءات بسلاسة وسرعة أكبر من توقعاتي.', author: 'أحمد المالكي', author_title: 'مؤسسة الديكور الذكي للمقاولات' },
    { quote: 'تعاملت مع المكتب في قضية معقدة والحمد لله تم حلها بأفضل صورة، أنصح بالتعامل معهم بكل ثقة.', author: 'سارة العتيبي', author_title: 'شركة الرواد للتجارة' },
    { quote: 'احترافية عالية وسرعة في الإنجاز، فريق متكامل يقدم حلولاً قانونية مبتكرة تراعي مصلحة العميل.', author: 'محمد الغامدي', author_title: 'مؤسسة الغامدي للمقاولات' },
  ]

  const [expandedServices, setExpandedServices] = useState([])
  const toggleService = (idx) => {
    setExpandedServices(prev => prev.includes(idx) ? prev.filter(x => x !== idx) : [...prev, idx])
  }

  const scrollTo = (id) => {
    if (id === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const swiperRef = useRef(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    getSections().then(setData).catch(() => {})
  }, [])

  useEffect(() => {
    const favicon = D.hero?.favicon
    if (!favicon) return
    let link = document.querySelector('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = favicon
  }, [D.hero?.favicon])
  useEffect(() => {
    const els = document.querySelectorAll('[data-animate]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15 })
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [data])

  useLayoutEffect(() => {
    if (trackRef.current?.parentElement) {
      const parentW = trackRef.current.parentElement.offsetWidth
      if (parentW > 0) {
        const cardW = (parentW - 60) / 4
        setStep(Math.round(cardW + 20))
      }
    }
  }, [teamMembers.length, data])

  return (
    <>
    <div className="col-top1" id="home">
      <div className="container">
        <header className="header" style={D.hero?.image ? { backgroundImage: `linear-gradient(250deg, rgba(34,34,34,0.8) 32%, rgba(34,34,34,0) 72%), url(${D.hero.image})` } : {}}>
          <div className="header-row-top">
            <img src="/assets/header-img.png" className="header-img-right" />

            <div className="header-nav-link">
              <span onClick={() => scrollTo('home')} className="header-text-menu5" style={{ cursor: 'pointer' }}>الرئيسية</span>
              <span onClick={() => scrollTo('about')} className="header-text-menu4" style={{ cursor: 'pointer' }}>من نحن</span>
              <span onClick={() => scrollTo('services')} className="header-text-menu3" style={{ cursor: 'pointer' }}>خدماتنا</span>
              <span onClick={() => scrollTo('team')} className="header-text-menu2" style={{ cursor: 'pointer' }}>موظفينا</span>
              <a href={`${D.contact?.whatsapp_link || 'https://wa.me/966'}${D.contact?.whatsapp_number || ''}`} target="_blank" rel="noopener noreferrer" className="header-text-menu1">تواصل معنا</a>
            </div>

            <a href={`${D.contact?.whatsapp_link || 'https://wa.me/966'}${D.contact?.whatsapp_number || ''}`} target="_blank" rel="noopener noreferrer"><button className="header-btn-content1 hover-dark text-neutral-500">{D.hero?.btn_free || 'استشارة مجانية'}</button></a>
          </div>

          <div className="header-content1" data-animate="hero-content">
            <div className="header-content2">
              <button className="btn btn2 hover-dark">
                <p className="btn-label">{D.hero?.badge || 'ريادة قانونية وحلول مستدامة'}</p>
                <img src="/assets/btn/btn-icon1.svg" className="btn-icon-message-question btn-icon" alt="" />
              </button>

              <div className="header-content3">
                <div className="header-content4">
                  <h2 className="header-subtitle">
                    {nl2br(D.hero?.title) || 'نحمـــي أعمالـــك ونصنـــع<br />الأثــر القانونــي لحقوقـــك'}
                  </h2>
                  <p className="header-text1">
                    {D.hero?.description || 'نقدم منظومة متكاملة من الاستشارات والخدمات القانونية وفق أعلـى المعاييــر المهنيــة والأنظمــة السعوديـة لحمايـة مصالحـك.'}
                  </p>
                </div>

                <a href={`${D.contact?.whatsapp_link || 'https://wa.me/966'}${D.contact?.whatsapp_number || ''}`} target="_blank" rel="noopener noreferrer"><button className="header-btn-content2 text-neutral-500 hover-dark">{D.hero?.btn_book || 'احجز استشارة'}</button></a>
              </div>
            </div>

            <div className="header-social-proof">
              <p className="header-text2">{D.hero?.social_proof || 'نحظى بثقة أكثر من +500 عميل في السعودية'}</p>

              <div className="header-row-bottom">
                <img src="/assets/header-img-circle1.png" className="header-img-circle header-img-circle1" />
                <img src="/assets/header-img-circle2.png" className="header-img-circle header-img-circle2" />
                <img src="/assets/header-img-circle3.png" className="header-img-circle header-img-circle3" />
                <div className="header-circle"><span>+</span></div>
                <img src="/assets/header-img-circle4.png" className="header-img-circle header-img-circle4" />
              </div>
            </div>
          </div>
        </header>

        <div className="container-about-us section1" id="about" data-animate>
          <div className="container-content1">
            <div className="container-content2">
              <h2 className="container-subtitle">{D.about?.title || 'عن شركة مؤثرون'}</h2>

              <div className="container-content3">
                <p className="container-text">{D.about?.text1 || 'هدفنا تقديم حلول قانونية راسخة تحمي مصالح الشركات والأفراد وتضمن تحقيق العدالة بدقة ومتانة.'}</p>
                <p className="container-text">{D.about?.text2 || 'ندمج بين أربعة عقود من الخبرة القضائية العميقة والمنهجيات الحديثة لنواجه أعقد التحديات بثقة مطلقة.'}</p>
              </div>
            </div>

            <div className="container-content-groups">
              {(D.about?.stats || [
                { value: '100%', label: 'نزاهة وسرية' },
                { value: '+1,500', label: 'قضية منجزة' },
                { value: '+500', label: 'شريك نجاح' },
                { value: '+40', label: "عاماً من الخبرة" }
              ]).map((stat, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  {i > 0 && (
                    <div className={`divider-a divider${i}`}>
                      <div className="divider-line1"></div>
                    </div>
                  )}
                  <AnimatedStat value={stat.value} label={stat.label} />
                </span>
              ))}
            </div>
          </div>

          <img src={D.about?.image || '/assets/container-img.png'} className="container-img" />
        </div>
      </div>

      <a href={`${D.contact?.whatsapp_link || 'https://wa.me/966'}${D.contact?.whatsapp_number || ''}`} target="_blank" rel="noopener noreferrer"><img src="/assets/whatsapp.png" className="whatsapp" /></a>
    </div>

    <div className="teams section1" id="team" data-animate>
      <div className="teams-content">
        <h2 className="teams-subtitle">
          {nl2br(D.teams?.title) || 'كفـاءات قانونيـة متميـزة<br />تقود نجاحاتك وتصنع الأثر.'}
        </h2>

        <div className="teams-content-groups1">
          <div onClick={nextTeam} className="circle-icon-container-a circle-icon-container3" style={{ cursor: 'pointer' }}>
            <img src="/assets/circle-icon-container/circle-icon-container-arrow-right.svg" className="circle-icon-container-arrow-right circle-icon-container-arrow-left" alt="" />
          </div>

          <div onClick={prevTeam} className="circle-icon-container-a circle-icon-container2" style={{ cursor: 'pointer' }}>
            <img src="/assets/circle-icon-container/circle-icon-container-arrow-left.svg" className="circle-icon-container-arrow-right circle-icon-container-arrow-left" alt="" />
          </div>
        </div>
      </div>

        <div className="teams-content-groups2">
        <div className="teams-track" ref={trackRef} style={{ transform: `translateX(${-teamIdx * (step || 1)}px)` }}>
          {teamMembers.map((member, i) => (
            <div key={i} className={`team-card team-card${(i % 4) + 1}`} style={member.image ? { backgroundImage: `url(${member.image})` } : {}}>
              <div className="team-card-content">
                <p className="team-card-name">{member.name}</p>
                <p className="team-card-title">{member.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="services section2" id="services" data-animate>
      <div className="column-a col-top2">
        <button className="btn btn1 hover-bright">
          <p className="btn-label">{D.services?.badge || 'خدماتنا القانونية'}</p>
          <img src="/assets/btn/btn-icon2.svg" className="btn-icon-message-question btn-icon" alt="" />
        </button>

        <h2 className="column-subtitle">{D.services?.title || 'خدمات قانونية متخصصة تصيغ الأمان لحقوقك'}</h2>
      </div>

      <div className="services-row">
        <div className="services-content-groups1">
          {servicesItems.slice(0, 4).map((item, i) => (
            <React.Fragment key={i}>
              <div className={`services-component${expandedServices.includes(i) ? ' expanded' : ''}`} onClick={() => toggleService(i)}>
                <img src={item.image || "/assets/services-img.png"} className="services-img" alt="" />
                <h2>{item.name}</h2>
              </div>
              {i < 3 && (
                <div className={`divider-b divider${i + 4}`}>
                  <div className="line divider-line2"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="line services-line"></div>

        <div className="services-content-groups2">
          {servicesItems.slice(4, 8).map((item, i) => (
            <React.Fragment key={i}>
              <div className={`services-component${expandedServices.includes(i + 4) ? ' expanded' : ''}`} onClick={() => toggleService(i + 4)}>
                <img src={item.image || "/assets/services-img.png"} className="services-img" alt="" />
                <h2 className={i === 2 ? 'services-subtitle7' : i === 3 ? 'services-subtitle8' : ''}>{item.name}</h2>
              </div>
              {i < 3 && (
                <div className={`divider-b divider${i + 6}`}>
                  <div className="line divider-line2"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>

    <div className="why-choose-us section2" data-animate>
      <div className="column-a col-top3">
        <button className="btn btn1 hover-bright">
          <p className="btn-label">{D.why_choose_us?.badge || 'لماذا "مؤثرون"'}</p>
          <img src="/assets/btn/btn-icon3.svg" className="btn-icon-message-question btn-icon" alt="" />
        </button>

        <h2 className="column-subtitle">{D.why_choose_us?.title || 'ثقة مبنية على أكثر من 40 عامًا من الخبرة'}</h2>
      </div>

      <div className="why-choose-us-col">
        <div className="row-a row-top2">
          {(D.why_choose_us?.cards || []).slice(0, 3).map((card, i) => (
            <div key={i} className={`why-choose-us-card why-choose-us-card${i + 1}`}>
              <div className="circle-icon-container-b circle-icon-container1">
                <object data={`/assets/circle-icon-container/circle-icon-container-${['lightbulb', 'handshake', 'headset'][i]}.svg`} className="circle-icon-container-gavel circle-icon-container-lightbulb" type="image/svg+xml" />
              </div>
              <div className="why-choose-us-card-content">
                <h2 className="why-choose-us-card-subtitle">{card.title}</h2>
                <p className="why-choose-us-card-text">{card.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="row-a row-bottom2">
          {(D.why_choose_us?.cards || []).slice(3, 6).map((card, i) => (
            <div key={i} className={`why-choose-us-card why-choose-us-card${i + 1}`}>
              <div className="circle-icon-container-b circle-icon-container1">
                <object data={`/assets/circle-icon-container/circle-icon-container-${['anonymous', 'medal', 'gavel'][i]}.svg`} className="circle-icon-container-gavel circle-icon-container-lightbulb" type="image/svg+xml" />
              </div>
              <div className="why-choose-us-card-content">
                <h2 className="why-choose-us-card-subtitle">{card.title}</h2>
                <p className="why-choose-us-card-text">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="col" data-animate>
      <div className="column-a content5">
        <button className="btn btn1 hover-bright">
          <p className="btn-label">{D.success_partners?.badge || 'شركاء النجاح'}</p>
          <img src="/assets/btn/btn-icon4.svg" className="btn-icon-message-question btn-icon" alt="" />
        </button>

        <h2 className="column-subtitle">{D.success_partners?.title || 'شركاؤنا هم سر نجاحنا وتميزنا'}</h2>
      </div>

      <div className="component component1">
      <div className="row-b">
        {(D.success_partners?.logos || []).map((logo, idx) => (
          <img key={idx} src={logo || "/assets/row/row-mask-group.png"} className="row-mask-group" />
        ))}
      </div>
      </div>
      </div>



    <div className="testimonials" data-animate>
      <Swiper
        onSlideChange={(s) => setActiveTestimonial(s.realIndex)}
        onSwiper={(s) => { swiperRef.current = s }}
        modules={[Autoplay]}
        autoplay={{ delay: 10000, disableOnInteraction: false }}
        slidesPerView={1}
        speed={500}
        observer={true}
        observeParents={true}
        className="testimonials-swiper"
      >
        {testimonialsData.map((t, i) => (
          <SwiperSlide key={i}>
            <div className="testimonials-slide-inner">
              <img src={t.image || "/assets/testimonials-img2.png"} className="testimonials-img2" />

              <div className="testimonials-content1">
                <div className="testimonials-content2">
                  <img src={t.logo || "/assets/testimonials-img1.png"} className="testimonials-img1" />

                  <div className="testimonials-content3">
                    <h2 className="testimonials-subtitle">{t.quote}</h2>

                    <div className="testimonials-content4">
                      <p className="testimonials-text1">{t.author}</p>
                      <p className="text-a testimonials-text2">{t.author_title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="testimonials-dots">
        {testimonialsData.map((_, i) => (
          <div
            key={i}
            className={`testimonials-dot ${i === activeTestimonial ? 'active' : ''}`}
            onClick={() => swiperRef.current?.slideTo(i)}
          />
        ))}
      </div>
    </div>

    <div className="faqs section2" data-animate>
      <div className="faqs-content">
        <button className="btn btn3 hover-bright">
          <p className="btn-label">{D.faqs?.badge || 'الأسئلة الشائعة'}</p>
          <img src="/assets/btn/btn-icon5.svg" className="btn-icon-message-question btn-icon" alt="" />
        </button>

        <h2 className="faqs-subtitle">{D.faqs?.title || 'دليلك السريع لأكثر الاستفسارات شيوعًا'}</h2>
        <p className="text-b faqs-text1">{D.faqs?.description || 'تعرف على كل ما تحتاج إليه من معلومات من خلال إجابات واضحة وسهلة الوصول.'}</p>
      </div>

      <div className="faqs-content-groups">
        {(D.faqs?.items || [
          { question: 'ما هي أنواع القضايا التي تتخصصون فيها؟', answer: 'إذا كنت تواجه قضية قانونية تؤثر على حقوقك أو ممتلكاتك أو حياتك الشخصية، فمن الأفضل استشارة محامي. سواء كانت نزاع عقود أو قضية أسرية أو مطالبة بالتعويض، يمكن لفريقنا تقييم وضعك وإرشادك خلال الإجراءات القانونية.' },
          { question: 'كيف يمكنني حجز استشارة قانونية مع مكتبكم؟', answer: 'إذا كنت تواجه قضية قانونية تؤثر على حقوقك أو ممتلكاتك أو حياتك الشخصية، فمن الأفضل استشارة محامي. سواء كانت نزاع عقود أو قضية أسرية أو مطالبة بالتعويض، يمكن لفريقنا تقييم وضعك وإرشادك خلال الإجراءات القانونية.' },
          { question: 'هل تقدمون خدمات قانونية عن بُعد لعملاء خارج الرياض؟', answer: 'إذا كنت تواجه قضية قانونية تؤثر على حقوقك أو ممتلكاتك أو حياتك الشخصية، فمن الأفضل استشارة محامي. سواء كانت نزاع عقود أو قضية أسرية أو مطالبة بالتعويض، يمكن لفريقنا تقييم وضعك وإرشادك خلال الإجراءات القانونية.' },
          { question: 'هل الاستشارة الأولى مجانية؟', answer: 'إذا كنت تواجه قضية قانونية تؤثر على حقوقك أو ممتلكاتك أو حياتك الشخصية، فمن الأفضل استشارة محامي. سواء كانت نزاع عقود أو قضية أسرية أو مطالبة بالتعويض، يمكن لفريقنا تقييم وضعك وإرشادك خلال الإجراءات القانونية.' },
          { question: 'هل تتعاملون مع قضايا المستثمرين والشركات الأجنبية في المملكة؟', answer: 'إذا كنت تواجه قضية قانونية تؤثر على حقوقك أو ممتلكاتك أو حياتك الشخصية، فمن الأفضل استشارة محامي. سواء كانت نزاع عقود أو قضية أسرية أو مطالبة بالتعويض، يمكن لفريقنا تقييم وضعك وإرشادك خلال الإجراءات القانونية.' },
        ]).map((item, i) => {
          const isOpen = i === openFaq
          return isOpen ? (
            <div key={i} className="faqs-accordion" onClick={() => setOpenFaq(-1)}>
              <div className="faqs-headline">
                <p className="faqs-text-headline">{item.question}</p>
                <img src="/assets/faqs-icon.svg" className="faqs-icon" alt="" />
              </div>
              <p className="faqs-text2">{item.answer}</p>
            </div>
          ) : (
            <div key={i} className="accordion" onClick={() => setOpenFaq(i)}>
              <p className="accordion-text">{item.question}</p>
              <img src="/assets/accordion/accordion-icon.svg" className="accordion-icon" alt="" />
            </div>
          )
        })}
      </div>
    </div>

    <footer className="footer">
      <div className="footer-banner1 section1">
        <div className="footer-banner2">
          <div className="footer-content1">
            <div className="footer-content2">
              <div className="footer-text1">{D.footer?.banner_title || 'نحو حلول قضائية واستراتيجية متكاملة.'}</div>
              <p className="text-b footer-text2">{D.footer?.banner_text || 'نقف إلى جانبكم، كتفاً بكتف، لتخطي كافة العقبات القانونية وتأمين أعمالكم.'}</p>
            </div>
            <a href={`${D.contact?.whatsapp_link || 'https://wa.me/966'}${D.contact?.whatsapp_number || ''}`} target="_blank" rel="noopener noreferrer"><button className="footer-btn hover-dark">{D.footer?.banner_btn || 'احجز استشارتك الآن'}</button></a>
          </div>
          <div className="footer-circle-lights1 circle"></div>
          <div className="footer-circle-lights2 circle"></div>
        </div>
      </div>

      <div className="footer-container section2">
        <div className="footer-content3">
          <div className="footer-content4">
            <div className="footer-row1">
              <h2 className="footer-subtitle1">{D.footer?.contact_email || 'info@alhaq-law.sa'}</h2>
              <a href={`${D.contact?.whatsapp_link || 'https://wa.me/966'}${D.contact?.whatsapp_number || ''}`} target="_blank" rel="noopener noreferrer" className="footer-text3">{D.footer?.contact_label || 'تواصل معنا'}</a>
              <h2>{D.footer?.contact_phone || '0555 467 674'}</h2>
            </div>

              <div className="footer-row2">
                <p className="text-a footer-text4">{D.footer?.services_title || 'خدماتنا القانونية'}</p>
                <div className="footer-row3">
                  <div className="column-b col-left">
                    {servicesItems.slice(0, 4).map((item, i) => (
                      <p key={i} className="column-text">{item.name}</p>
                    ))}
                  </div>
                  <div className="column-b col-right">
                    {servicesItems.slice(4, 8).map((item, i) => (
                      <p key={i} className="column-text">{item.name}</p>
                    ))}
                  </div>
                </div>
              </div>

            <div className="footer-row4">
              <p className="footer-text5">{D.footer?.quick_links_title || 'الروابط السريعة'}</p>
              {(D.footer?.quick_links || ['الرئيسية', 'من نحن', 'خدماتنا القانونية', 'موظفينا', 'تواصل معنا']).map((item, i) => {
                const sectionId = item === 'الرئيسية' ? 'home' : item === 'من نحن' ? 'about' : item === 'خدماتنا القانونية' ? 'services' : item === 'موظفينا' ? 'team' : null
                return (
                <div key={i} className={`row-c row${i + 1}`}>
                  {item === 'تواصل معنا' ? (
                    <a href={`${D.contact?.whatsapp_link || 'https://wa.me/966'}${D.contact?.whatsapp_number || ''}`} target="_blank" rel="noopener noreferrer" className="text-c row-text">{item}</a>
                  ) : (
                    <span onClick={() => scrollTo(sectionId)} className="text-c row-text" style={{ cursor: 'pointer' }}>{item}</span>
                  )}
                  <img src="/assets/row/row-graphic.svg" className="row-graphic" alt="" />
                </div>
                )
              })}
            </div>

            <div className="footer-row5">
              <img src={D.footer?.logo || "/assets/footer-img.png"} className="footer-img" />
              <p className="footer-text6">{D.footer?.logo_text || 'ثقة مبنية على أكثر من 40 عامًا من الخبرة القانونية والتميز في خدمة عملائنا.'}</p>
            </div>
          </div>

          <div className="footer-content5">
            <div className="footer-divider">
              <div className="footer-line"></div>
            </div>
            <div className="footer-content6">
              <p className="text-c footer-text-symbol">{D.footer?.copyright || 'جميع الحقوق محفوظة © لـ شركة مؤثرون 2026'}</p>
              <div className="footer-row-left">
                {['facebook', 'instagram', 'whatsapp', 'linkedin', 'youtube'].map((name, i) => {
                  const linkName = name === 'whatsapp' ? 'whatsapp' : name
                  const href = D.footer?.social_links?.[linkName] || (name === 'whatsapp' ? `${D.contact?.whatsapp_link || 'https://wa.me/966'}${D.contact?.whatsapp_number || ''}` : '')
                  return (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={`circle-a circle${i + 2}`}>
                      <object data={`/assets/circle/circle-${name}.svg`} className="circle-youtube circle-facebook" type="image/svg+xml" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}
