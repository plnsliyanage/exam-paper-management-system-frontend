import api from "./axios";


/* ===========================
   Dashboard
=========================== */

export const getDashboard = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/dashboard`
    );

    return response.data;
};



/* ===========================
   Assigned Packets
=========================== */

export const getAssignedPackets = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/packets`
    );

    return response.data;
};



export const getPacketDetails = async (packetId) => {

    const response = await api.get(
        `/lecturer/packets/${packetId}`
    );

    return response.data;
};



/* ===========================
   Marking
=========================== */

export const addMarkingScripts = async (markingData) => {

    const response = await api.post(
        "/lecturer/marking",
        markingData
    );

    return response.data;
};



export const getMarkingProcess = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/marking-process`
    );

    return response.data;
};



/* ===========================
   Previous Packets
=========================== */

export const getPreviousPackets = async () => {

    const response = await api.get(
        "/lecturer/packets/previous"
    );

    return response.data;
};



/* ===========================
   Packet Movement
=========================== */

export const getPacketMovements = async (packetId) => {

    const response = await api.get(
        `/lecturer/packets/${packetId}/movements`
    );

    return response.data;
};



export const getPacketMovementHistory = async (packetId) => {

    const response = await api.get(
        `/lecturer/packets/${packetId}/movements`
    );

    return response.data;
};



/* ===========================
   Update Packet Status
=========================== */

export const updatePacketStatus = async (
    packetId,
    data
) => {

    const response = await api.put(
        `/lecturer/packets/${packetId}/status`,
        data
    );

    return response.data;
};



/* ===========================
   Notifications
=========================== */

export const getNotifications = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/notifications`
    );

    return response.data;
};



/* ===========================
   Workload Summary
=========================== */

export const getWorkloadSummary = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/workload-statistics`
    );

    return response.data;
};



/* ===========================
   Deadline Calendar
=========================== */

export const getDeadlineCalendar = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/deadline-calendar`
    );

    return response.data;
};



/* ===========================
   Printing Schedule
=========================== */

export const getPrintingSchedules = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/printing-schedules`
    );

    return response.data;
};



/* ===========================
   Task Summary
=========================== */

export const getTaskSummary = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/task-summary`
    );

    return response.data;
};



/* ===========================
   Marking Summary
=========================== */

export const getMarkingSummary = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/marking-summary`
    );

    return response.data;
};



/* ===========================
   Assigned Packet Count
=========================== */

export const getAssignedPacketCount = async (lecturerId) => {

    const response = await api.get(
        `/lecturer/${lecturerId}/assigned-packets/count`
    );

    return response.data;
};