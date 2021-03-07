const decodeTrackingId = trackingId=>{
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    if (trackingId && days.indexOf(trackingId.substr(6, 2)) < 0) {
        return -1;
    }
    if (trackingId && trackingId.toString().length > 8) {
        return parseInt(trackingId.substr(8).toLowerCase(), 36);
    }
    return -1;
};

export default decodeTrackingId;