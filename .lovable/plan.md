

# Kobciye International Platform - Implementation Plan

## Overview
A professional bilingual (Somali/English) educational platform where students can discover courses, enroll, track their progress, book appointments, and manage their learning journey. The design will follow the reference image style with deep blue (#003366) primary color, clean whites, and an accent green for the Kobciye brand.

---

## Phase 1: Foundation & Landing Page

### Design System Setup
- Custom color palette: Deep Blue primary, Clean White, Accent Green (#22C55E)
- Typography: Inter font family for modern, professional look
- Install Framer Motion for subtle animations
- Configure Tailwind with custom brand colors

### Navigation Bar
- Sticky header with glassmorphism effect
- Logo: "Kobciye International" with brand icon
- Nav links: Home, Courses, About, Contact
- Language toggle (EN/SO) button
- Login / Enroll Now buttons
- Mobile hamburger menu
- Dark mode toggle

### Hero Section
- Bold headline in selected language
- Subheadline about empowering education
- Course search bar
- "Joined by X+ students" social proof with avatars
- Grid of educational imagery (Health, IT, Languages)
- Call-to-action buttons

### Statistics Bar
- Animated counters (5,000+ Students, 50+ Teachers, 20+ Courses, 10+ Years)
- Deep blue background with white text
- Scroll-triggered animations

---

## Phase 2: Course Discovery

### Popular Courses Section
- "Our Popular Courses" heading with "Explore All" link
- Grid of course cards featuring:
  - Course image/illustration
  - Category badge (Health Science, Technology, Language)
  - Course title
  - Instructor name with avatar
  - Duration/format (Full-time, Online, Intensive)
  - "View Details" link

### Course Detail Page
- Course hero with full description
- Learning outcomes
- Curriculum breakdown
- Instructor bio
- Enrollment CTA with pricing
- Related courses

### Courses Listing Page
- Filter by category
- Search functionality
- Grid/list view toggle

---

## Phase 3: Content Pages

### About Us Page
- Company mission and vision
- History of Kobciye International
- Leadership team section
- Values and achievements
- Campus/facility showcase

### Contact Page
- Contact form (name, email, phone, message)
- Office location with map
- Phone and email contact details
- Social media links
- FAQ accordion

### Student Success Stories
- Video testimonials section (with play button overlays)
- Written testimonials carousel
- Alumni achievements

---

## Phase 4: User Authentication & Portal

### Authentication System (Lovable Cloud)
- User registration with email/password
- Login page with "forgot password" flow
- Profile creation during signup
- Protected routes for enrolled users

### Student Dashboard
- Welcome message with user name
- Enrolled courses with progress bars
- Upcoming appointments/classes
- Recent activity feed
- Quick actions (continue learning, book appointment)

### User Profile
- Profile picture and bio
- Personal information editing
- Notification preferences
- Language preference setting

---

## Phase 5: Core Features

### Progress Tracking
- Visual progress indicators per course
- Completed lessons tracker
- Certificates section (earned/available)
- Learning streaks and achievements

### Appointment Booking
- Calendar view of available slots
- Consultation type selection
- Instructor/counselor selection
- Booking confirmation with email notification
- My Appointments management

### Payment Integration (Stripe)
- Course enrollment checkout
- Secure payment processing
- Payment history
- Invoice generation

---

## Phase 6: Bilingual Support & Polish

### Language System
- English/Somali toggle
- Content translation for all static text
- Persistent language preference
- RTL support consideration for Somali

### Footer
- Multi-column layout
- Quick Links (Course Catalog, Academic Calendar, etc.)
- Contact information with icons
- Newsletter signup form
- Social media icons
- Copyright and legal links

### Final Polish
- Dark mode theme with proper contrast
- Loading states and skeletons
- Error handling and user feedback
- Mobile responsiveness testing
- Performance optimization

---

## Technical Requirements

**Backend (Lovable Cloud):**
- Database tables: users, profiles, courses, enrollments, appointments, progress
- Row-level security for user data
- Edge functions for notifications

**Integrations:**
- Stripe for payments
- Resend for email notifications (optional)

**Design:**
- Framer Motion animations
- Shadcn/UI components
- Lucide icons
- Responsive breakpoints

---

## Sample Content
All pages will include realistic sample content in both English and Somali, featuring:
- 6-8 sample courses (IT, Health Sciences, English, Business)
- Sample instructors with bios
- Placeholder student testimonials
- Realistic pricing

