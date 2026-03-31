/**
 * Socket Manager
 * Manages all real-time WebSocket events.
 *
 * ROOM CONVENTION: `hackathon_<hackathonId>`
 * All users join their hackathon room on connect.
 *
 * CLIENT -> SERVER events:
 *   join-hackathon      { hackathonId }
 *   leave-hackathon     { hackathonId }
 *   broadcast:new       { hackathonId, message }       (Admin)
 *   leaderboard:update  { hackathonId, round }         (Admin — manual trigger)
 *   shortlist:update    { hackathonId, teamId, status }(Admin)
 *   help:request        { hackathonId, teamId, subject, description, location } (Student)
 *   qr:scan             { hackathonId, userId, type }  (Student/Scanner)
 *
 * SERVER -> CLIENT events (emitted to hackathon room):
 *   broadcast:receive       { message, sentBy, sentAt }
 *   leaderboard:live-update { round, teamId }
 *   shortlist:update        { teamId, status }
 *   attendance:update       { userId, checkedInAt }
 *   food:update             { userId, mealType, claimedAt }
 *   help:new-request        { teamId, subject, location }
 */

const initSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] Connected: ${socket.id}`);

        // ─── Room Management ────────────────────────────────────────────────
        socket.on('join-hackathon', (hackathonId) => {
            if (!hackathonId) return;
            socket.join(`hackathon_${hackathonId}`);
            console.log(`[Socket] ${socket.id} joined hackathon_${hackathonId}`);
        });

        socket.on('leave-hackathon', (hackathonId) => {
            if (!hackathonId) return;
            socket.leave(`hackathon_${hackathonId}`);
            console.log(`[Socket] ${socket.id} left hackathon_${hackathonId}`);
        });

        // ─── Admin Emits ────────────────────────────────────────────────────

        /**
         * broadcast:new
         * Admin sends a realtime broadcast message.
         * Server relays it to the whole hackathon room.
         * NOTE: The REST endpoint also triggers this; this handler
         *       lets Person 2's frontend trigger it directly via socket too.
         */
        socket.on('broadcast:new', ({ hackathonId, message, sentBy }) => {
            if (!hackathonId || !message) return;
            io.to(`hackathon_${hackathonId}`).emit('broadcast:receive', {
                message,
                sentBy: sentBy || 'Admin',
                sentAt: new Date().toISOString()
            });
            console.log(`[Socket] broadcast:receive → hackathon_${hackathonId}`);
        });

        /**
         * leaderboard:update
         * Admin manually triggers a leaderboard push (e.g., after bulk grading).
         * Server relays it to the room. Clients should then re-fetch.
         */
        socket.on('leaderboard:update', ({ hackathonId, round }) => {
            if (!hackathonId) return;
            io.to(`hackathon_${hackathonId}`).emit('leaderboard:live-update', {
                round: round || 'round1',
                triggeredAt: new Date().toISOString()
            });
            console.log(`[Socket] leaderboard:live-update → hackathon_${hackathonId} round=${round}`);
        });

        /**
         * shortlist:update
         * Admin shortlists / un-shortlists a team.
         * Server broadcasts the team's new status to the room.
         */
        socket.on('shortlist:update', ({ hackathonId, teamId, status }) => {
            if (!hackathonId || !teamId) return;
            io.to(`hackathon_${hackathonId}`).emit('shortlist:update', {
                teamId,
                status,
                updatedAt: new Date().toISOString()
            });
            console.log(`[Socket] shortlist:update → hackathon_${hackathonId} team=${teamId} status=${status}`);
        });

        // ─── Student Emits ──────────────────────────────────────────────────

        /**
         * help:request
         * Student sends a help request via socket.
         * Server broadcasts it to all admins/mentors in the room.
         * NOTE: REST endpoint also handles persistence; this is for instant notify.
         */
        socket.on('help:request', ({ hackathonId, teamId, subject, description, location }) => {
            if (!hackathonId || !subject) return;
            io.to(`hackathon_${hackathonId}`).emit('help:new-request', {
                teamId,
                subject,
                description,
                location,
                requestedAt: new Date().toISOString()
            });
            console.log(`[Socket] help:new-request → hackathon_${hackathonId} team=${teamId}`);
        });

        /**
         * qr:scan
         * Scanner/Student emits after a QR scan. Server notifies the room
         * (e.g., attendance board updates in real-time for admin dashboards).
         */
        socket.on('qr:scan', ({ hackathonId, userId, type }) => {
            if (!hackathonId || !userId) return;

            if (type === 'attendance') {
                io.to(`hackathon_${hackathonId}`).emit('attendance:update', {
                    userId,
                    checkedInAt: new Date().toISOString()
                });
                console.log(`[Socket] attendance:update → hackathon_${hackathonId} user=${userId}`);
            } else if (type === 'food') {
                io.to(`hackathon_${hackathonId}`).emit('food:update', {
                    userId,
                    claimedAt: new Date().toISOString()
                });
                console.log(`[Socket] food:update → hackathon_${hackathonId} user=${userId}`);
            }
        });

        // ─── Disconnect ─────────────────────────────────────────────────────
        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });
};

/**
 * Helpers for controllers to emit server-side events.
 * Usage: emitToHackathon(req.io, hackathonId, 'leaderboard:live-update', { round, teamId })
 */
const emitToHackathon = (io, hackathonId, event, data = {}) => {
    if (!io || !hackathonId) return;
    io.to(`hackathon_${hackathonId}`).emit(event, {
        ...data,
        emittedAt: new Date().toISOString()
    });
};

module.exports = { initSocketHandlers, emitToHackathon };
