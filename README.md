# Student Accommodation Management System

A comprehensive SaaS rental management system for handling student accommodations with features for student management, rent tracking, automated email notifications, and a complete dashboard.

## Features

### Core Modules

1. **Dashboard**
   - Real-time analytics and statistics
   - Occupancy rate visualization
   - Revenue trends and charts
   - Recent activity feed
   - Quick action buttons

2. **Student Management**
   - Add, edit, delete students with full profiles
   - Bulk import via Excel
   - Room assignments
   - Emergency contact information
   - Status tracking (active, inactive, pending)

3. **Room Management**
   - Track rooms across multiple buildings
   - Room types: Single/Double occupancy
   - AC/Non-AC room options
   - Occupancy monitoring
   - Capacity limits enforcement
   - Monthly rent configuration

4. **Rent Tracking**
   - Payment status tracking (pending, paid, overdue)
   - Automatic overdue detection
   - Payment history
   - Monthly revenue reports
   - Export to Excel

5. **Email Notifications**
   - Automated rent reminders
     - 2 days before due date
     - On due date
     - 2 days after (overdue notice)
   - Bulk email sending
   - Email templates with variables
   - Email logs and tracking

6. **Settings**
   - Company configuration
   - Building management
   - Email SMTP settings
   - Notification preferences
   - Rent due day configuration

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Excel**: xlsx library
- **Date Handling**: date-fns

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to the SQL Editor
4. Copy the contents of `supabase_schema.sql` and run it
5. Go to Project Settings > API to get your credentials

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Database Schema

### Tables

- **buildings**: Store accommodation buildings
- **rooms**: Store room information with type, AC status, capacity
- **students**: Store student profiles and room assignments
- **payments**: Store rent payment records
- **email_logs**: Store email notification history
- **settings**: Store system configuration

### Key Relationships

- Rooms belong to Buildings
- Students can be assigned to Rooms
- Payments belong to Students and Rooms
- Email logs reference Students

## Automated Features

### Rent Reminders

The system automatically sends email notifications at three stages:

1. **Reminder Before**: Configurable days before due date (default: 2 days)
2. **Due Date**: On the rent due date
3. **Overdue Notice**: Configurable days after due date (default: 2 days)

### Overdue Detection

Payments are automatically marked as overdue when:
- Status is "pending"
- Due date has passed

### Room Occupancy

Room status is automatically updated based on:
- Number of active students assigned
- Room capacity limits

## Email Templates

The system includes pre-built email templates with variable substitution:

Available variables:
- `{{student_name}}` - Full name of student
- `{{student_id}}` - Student ID
- `{{email}}` - Student email
- `{{phone}}` - Student phone
- `{{room_number}}` - Assigned room number
- `{{building_name}}` - Building name
- `{{amount}}` - Payment amount
- `{{due_date}}` - Payment due date

## Excel Import Format

For bulk student import, use the following columns:

| Column | Description |
|--------|-------------|
| Student ID | Unique student identifier |
| First Name | Student's first name |
| Last Name | Student's last name |
| Email | Student's email address |
| Phone | Contact number |
| Date of Birth | Format: YYYY-MM-DD |
| Emergency Contact Name | Name of emergency contact |
| Emergency Contact Phone | Emergency contact number |
| Emergency Contact Relation | Relationship to student |
| Room ID | (Optional) Room assignment |
| Move-in Date | Format: YYYY-MM-DD |
| Status | active, inactive, or pending |

Download the template from the Students page.

## Configuration Options

### General Settings

- **Company Name**: Display name for the system
- **Rent Due Day**: Day of month when rent is due (1-31)
- **Reminder Before Days**: Days before due to send reminder
- **Reminder After Days**: Days after due to send overdue notice

### Email Settings

- **Sender Name**: Name displayed in sent emails
- **Sender Email**: From address for emails
- **SMTP Host**: SMTP server hostname
- **SMTP Port**: SMTP server port (usually 587)
- **SMTP Username**: SMTP authentication username
- **SMTP Password**: SMTP authentication password

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Row Level Security**: Enable RLS policies in production
3. **Authentication**: Consider adding user authentication
4. **API Keys**: Use restricted API keys in production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License

## Support

For issues and feature requests, please create an issue in the repository.
