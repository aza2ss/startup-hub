/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Delete all existing data
  await prisma.comment.deleteMany({});
  await prisma.teamApplication.deleteMany({});
  await prisma.teamRequest.deleteMany({});
  await prisma.progressUpdate.deleteMany({});
  await prisma.projectLink.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const users = [
    {
      id: 'user-current',
      name: 'Алексей Петров',
      avatar: 'https://i.pravatar.cc/150?img=11',
      role: 'Основатель проекта',
      bio: 'Профиль пока не заполнен. Добавьте информацию о себе, навыках и проектах.',
      skills: '',
      createdAt: new Date('2026-01-10T09:00:00Z'),
    },
    {
      id: 'user-2',
      name: 'Мария Иванова',
      avatar: 'https://i.pravatar.cc/150?img=20',
      role: 'Frontend-разработчик',
      bio: 'Работает с React, TypeScript и интерфейсами для внутренних продуктов.',
      skills: 'React,TypeScript,Tailwind CSS',
      createdAt: new Date('2026-02-14T10:00:00Z'),
    },
    {
      id: 'user-3',
      name: 'Дмитрий Козлов',
      avatar: 'https://i.pravatar.cc/150?img=33',
      role: 'Product/UI дизайнер',
      bio: 'Проектирует веб и мобильные интерфейсы для early-stage продуктов.',
      skills: 'Figma,UX Research,UI Design',
      createdAt: new Date('2026-03-03T11:00:00Z'),
    },
    {
      id: 'user-4',
      name: 'Анна Смирнова',
      avatar: 'https://i.pravatar.cc/150?img=47',
      role: 'Backend-разработчик',
      bio: 'Node.js, PostgreSQL, REST API, интеграции платежей.',
      skills: 'Node.js,PostgreSQL,REST API',
      createdAt: new Date('2026-03-20T12:00:00Z'),
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log('Seeded users.');

  // 3. Create Projects
  const projectsData = [
    {
      id: 'proj-1',
      title: 'HackTeam',
      description: 'Сервис для поиска команды на хакатоны в Алматы и Астане.',
      longDescription: 'HackTeam помогает участникам хакатонов находить команду по роли, стеку и городу. На первом этапе команда делает каталог событий, заявки на открытые роли и простой отклик через Telegram.',
      status: 'mvp',
      category: 'EdTech',
      tags: 'хакатоны,команда,Алматы',
      technologies: 'Next.js,TypeScript,PostgreSQL',
      progress: 40,
      ownerId: 'user-current',
      createdAt: new Date('2026-02-10T10:00:00Z'),
      updatedAt: new Date('2026-06-11T14:00:00Z'),
      teamMembers: ['user-current', 'user-2'],
      links: [
        { label: 'GitHub', url: 'https://github.com' },
        { label: 'Telegram', url: 'https://t.me' },
      ],
      openPositions: [
        {
          id: 'tr-1',
          role: 'Backend-разработчик',
          description: 'Нужен человек для API заявок, матчинг-логики и уведомлений. Стек: Node.js, PostgreSQL.',
          skills: 'Node.js,PostgreSQL,REST API',
          createdAt: new Date('2026-05-20T09:00:00Z'),
        },
      ],
      progressLog: [
        {
          id: 'pu-1-1',
          authorId: 'user-current',
          content: 'Собрали список из 12 хакатонов в Казахстане на ближайшие 3 месяца.',
          type: 'milestone',
          createdAt: new Date('2026-03-01T10:00:00Z'),
        },
        {
          id: 'pu-1-2',
          authorId: 'user-2',
          content: 'Готов прототип страницы поиска команды с фильтрами по роли, городу и стеку.',
          type: 'update',
          createdAt: new Date('2026-05-15T11:00:00Z'),
        },
        {
          id: 'pu-1-3',
          authorId: 'user-current',
          content: 'Показали MVP на демо-встрече Astana Hub, получили 8 заявок на тест.',
          type: 'launch',
          createdAt: new Date('2026-06-08T09:00:00Z'),
        },
      ],
    },
    {
      id: 'proj-2',
      title: 'GrantTrack',
      description: 'Рабочий кабинет для отслеживания заявок на гранты и акселераторы.',
      longDescription: 'GrantTrack помогает основателям вести дедлайны, статусы, чек-листы документов и историю заявок в программы Astana Hub, QazInnovations и локальные акселераторы.',
      status: 'idea',
      category: 'SaaS',
      tags: 'гранты,стартапы,документы',
      technologies: 'React,Supabase',
      progress: 15,
      ownerId: 'user-2',
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date('2026-06-10T16:00:00Z'),
      teamMembers: ['user-2', 'user-3'],
      links: [{ label: 'Notion', url: 'https://notion.so' }],
      openPositions: [
        {
          id: 'tr-2',
          role: 'Product-менеджер',
          description: 'Помочь описать user flow и приоритизировать MVP. Опыт с грантовыми программами будет плюсом.',
          skills: 'Product,CustDev,Документация',
          createdAt: new Date('2026-05-25T10:00:00Z'),
        },
      ],
      progressLog: [
        {
          id: 'pu-2-1',
          authorId: 'user-2',
          content: 'Опросили 8 основателей: большинство ведет заявки в Excel, Notion или Telegram.',
          type: 'update',
          createdAt: new Date('2026-04-15T10:00:00Z'),
        },
      ],
    },
    {
      id: 'proj-3',
      title: 'StudBudget',
      description: 'Приложение для учета расходов студентов.',
      longDescription: 'StudBudget делает простой учет трат без банковских интеграций: категории, лимиты на месяц, ручной ввод и экспорт в CSV. Первая аудитория - студенты Алматы и Караганды.',
      status: 'mvp',
      category: 'FinTech',
      tags: 'студенты,бюджет,мобильное приложение',
      technologies: 'React Native,Node.js',
      progress: 55,
      ownerId: 'user-3',
      createdAt: new Date('2026-01-20T10:00:00Z'),
      updatedAt: new Date('2026-06-12T11:00:00Z'),
      teamMembers: ['user-3', 'user-4'],
      links: [
        { label: 'GitHub', url: 'https://github.com' },
        { label: 'Figma', url: 'https://figma.com' },
      ],
      openPositions: [
        {
          id: 'tr-4',
          role: 'Mobile-разработчик',
          description: 'Нужно собрать основные экраны на React Native или Flutter. Дизайн уже готов.',
          skills: 'React Native,Flutter,Mobile',
          createdAt: new Date('2026-06-05T10:00:00Z'),
        },
      ],
      progressLog: [
        {
          id: 'pu-3-1',
          authorId: 'user-3',
          content: 'Готов дизайн 5 основных экранов.',
          type: 'update',
          createdAt: new Date('2026-03-10T10:00:00Z'),
        },
        {
          id: 'pu-3-2',
          authorId: 'user-4',
          content: 'API для категорий и транзакций работает, добавили экспорт CSV.',
          type: 'milestone',
          createdAt: new Date('2026-05-01T14:00:00Z'),
        },
      ],
    },
    {
      id: 'proj-4',
      title: 'CourtBook',
      description: 'Сервис бронирования спортивных площадок в Алматы.',
      longDescription: 'CourtBook показывает доступные слоты для футбольных и баскетбольных площадок, хранит бронирования и готовится к подключению оплаты через Kaspi QR.',
      status: 'growth',
      category: 'Marketplace',
      tags: 'спорт,бронирование,Алматы',
      technologies: 'Next.js,NestJS,PostgreSQL',
      progress: 70,
      ownerId: 'user-4',
      createdAt: new Date('2025-09-01T10:00:00Z'),
      updatedAt: new Date('2026-06-13T09:00:00Z'),
      teamMembers: ['user-4'],
      links: [{ label: 'Сайт', url: 'https://example.com' }],
      openPositions: [
        {
          id: 'tr-5',
          role: 'Менеджер партнерств',
          description: 'Подключение новых площадок, переговоры и onboarding партнеров.',
          skills: 'Продажи,Переговоры',
          createdAt: new Date('2026-05-10T10:00:00Z'),
        },
      ],
      progressLog: [
        {
          id: 'pu-4-1',
          authorId: 'user-4',
          content: 'Подключили 3 площадки и запустили бронирование слотов.',
          type: 'launch',
          createdAt: new Date('2026-01-15T10:00:00Z'),
        },
        {
          id: 'pu-4-2',
          authorId: 'user-4',
          content: '120 бронирований за май, средний чек 4 500 тенге.',
          type: 'milestone',
          createdAt: new Date('2026-06-01T11:00:00Z'),
        },
      ],
    },
    {
      id: 'proj-5',
      title: 'InternFinder',
      description: 'Агрегатор стажировок для студентов IT-направлений.',
      longDescription: 'InternFinder собирает стажировки из Telegram-каналов, сайтов компаний и карьерных порталов. MVP включает ручную модерацию, фильтры по городу, стеку и формату работы.',
      status: 'idea',
      category: 'HR Tech',
      tags: 'стажировки,студенты,IT',
      technologies: 'Next.js,Python',
      progress: 10,
      ownerId: 'user-2',
      createdAt: new Date('2026-05-15T10:00:00Z'),
      updatedAt: new Date('2026-06-09T10:00:00Z'),
      teamMembers: ['user-2'],
      links: [],
      openPositions: [
        {
          id: 'tr-6',
          role: 'Full-stack разработчик',
          description: 'Нужен сооснователь на техническую часть: парсинг, админка и простой каталог.',
          skills: 'Next.js,Python,PostgreSQL',
          createdAt: new Date('2026-06-01T10:00:00Z'),
        },
      ],
      progressLog: [
        {
          id: 'pu-5-1',
          authorId: 'user-2',
          content: 'Собрали 40 ссылок на стажировки вручную для проверки идеи.',
          type: 'milestone',
          createdAt: new Date('2026-05-25T10:00:00Z'),
        },
      ],
    },
  ];

  for (const proj of projectsData) {
    const { links, openPositions, progressLog, teamMembers, ...rest } = proj;

    await prisma.project.create({
      data: {
        ...rest,
        teamMembers: {
          connect: teamMembers.map(id => ({ id })),
        },
        links: {
          create: links,
        },
        openPositions: {
          create: openPositions,
        },
        progressLog: {
          create: progressLog,
        },
      },
    });
  }

  console.log('Seeded projects, links, open positions, and progress logs.');
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
