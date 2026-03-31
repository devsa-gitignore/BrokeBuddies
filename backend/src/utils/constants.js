/**
 * Application Constants
 */

const ROLES = {
    STUDENT: 'student',
    ADMIN: 'admin'
};

const HACKATHON_STATUS = {
    UPCOMING: 'upcoming',
    OPEN: 'open',
    ONGOING: 'ongoing',
    CLOSED: 'closed'
};

const TEAM_STATUS = {
    PENDING: 'pending',
    REGISTERED: 'registered',
    SHORTLISTED: 'shortlisted',
    FINALIST: 'finalist',
    WINNER: 'winner'
};

const MEAL_TYPES = {
    BREAKFAST: 'breakfast',
    LUNCH: 'lunch',
    DINNER: 'dinner'
};

const QR_TYPES = {
    ENTRY: 'entry',
    BREAKFAST: 'breakfast',
    LUNCH: 'lunch',
    DINNER: 'dinner'
};

const CERTIFICATE_TYPES = {
    PARTICIPATION: 'participation',
    WINNER: 'winner',
    RUNNER_UP: 'runner_up',
    SECOND_RUNNER_UP: 'second_runner_up'
};

module.exports = { ROLES, HACKATHON_STATUS, TEAM_STATUS, MEAL_TYPES, QR_TYPES, CERTIFICATE_TYPES };
