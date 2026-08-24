import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PageBanner from '../components/PageBanner';
import api from '../api/client';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RoomDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [step, setStep] = useState('dates'); // dates -> details -> review -> confirmed
  const [dates, setDates] = useState({
    checkIn: searchParams.get('checkIn') || todayISO(),
    checkOut: searchParams.get('checkOut') || '',
    adults: 2,
    children: 0,
  });
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '', specialRequests: '' });
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get(`/rooms/${slug}`)
      .then(({ data }) => active && setRoom(data.data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  const nights =
    dates.checkIn && dates.checkOut
      ? Math.max(0, Math.round((new Date(dates.checkOut) - new Date(dates.checkIn)) / (1000 * 60 * 60 * 24)))
      : 0;
  const estimatedTotal = room ? (room.price * nights).toFixed(2) : '0.00';

  const checkDates = async (e) => {
    e.preventDefault();
    setCheckingAvailability(true);
    setAvailability(null);
    try {
      const { data } = await api.get(`/rooms/${room._id}/availability`, {
        params: { checkIn: dates.checkIn, checkOut: dates.checkOut },
      });
      setAvailability(data.data);
      if (data.data.available) setStep('details');
    } catch (err) {
      setAvailability({ available: false, message: err.message });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const submitBooking = async () => {
    setSubmitting(true);
    setBookingError('');
    try {
      const { data } = await api.post('/bookings', {
        roomId: room._id,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        guests: { adults: Number(dates.adults), children: Number(dates.children) },
        guest,
      });
      setBookingResult(data.data);
      setStep('confirmed');
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container p-tb80 text-center">Loading room&hellip;</div>;
  if (error || !room) {
    return <div className="container p-tb80 text-center text-danger">{error || 'Room not found.'}</div>;
  }

  return (
    <>
      <PageBanner title={room.name} crumbs={[{ label: 'Rooms', to: '/rooms' }, { label: room.name }]} image="/assets/images/banner/3.jpg" />

      <div className="section-full p-tb80">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="wt-media m-b30">
                <img
                  src={room.images?.[0]?.url || '/assets/images/rooms/pic1.jpg'}
                  alt={room.name}
                  style={{ width: '100%', borderRadius: 4 }}
                />
              </div>
              {room.images?.length > 1 && (
                <div className="row m-b30">
                  {room.images.slice(1).map((img) => (
                    <div className="col-4" key={img.publicId}>
                      <img src={img.url} alt={room.name} style={{ width: '100%', borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
              )}

              <h2 className="m-b15">{room.name}</h2>
              <p>{room.description}</p>

              <div className="row m-b30">
                <div className="col-md-4">
                  <strong>Capacity:</strong> {room.capacityAdults} adults
                  {room.capacityChildren ? `, ${room.capacityChildren} children` : ''}
                </div>
                {room.sizeSqft && (
                  <div className="col-md-4">
                    <strong>Size:</strong> {room.sizeSqft} sqft
                  </div>
                )}
                {room.bedType && (
                  <div className="col-md-4">
                    <strong>Bed:</strong> {room.bedType}
                  </div>
                )}
              </div>

              {room.amenities?.length > 0 && (
                <>
                  <h3 className="m-b15">Amenities</h3>
                  <div className="row m-b30">
                    {room.amenities.map((a) => (
                      <div className="col-md-4 m-b15" key={a._id}>
                        <i className={`${a.icon} m-r10`} /> {a.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="col-lg-4">
              <div className="bg-gray p-a30" style={{ borderRadius: 4 }}>
                <h3 className="m-t0 m-b20">${room.price.toFixed(2)} / night</h3>

                {step === 'dates' && (
                  <form onSubmit={checkDates}>
                    <div className="form-group">
                      <label>Check-in</label>
                      <input
                        type="date"
                        required
                        min={todayISO()}
                        className="form-control"
                        value={dates.checkIn}
                        onChange={(e) => setDates((d) => ({ ...d, checkIn: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Check-out</label>
                      <input
                        type="date"
                        required
                        min={dates.checkIn}
                        className="form-control"
                        value={dates.checkOut}
                        onChange={(e) => setDates((d) => ({ ...d, checkOut: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Adults</label>
                      <input
                        type="number"
                        min="1"
                        max={room.capacityAdults}
                        className="form-control"
                        value={dates.adults}
                        onChange={(e) => setDates((d) => ({ ...d, adults: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Children</label>
                      <input
                        type="number"
                        min="0"
                        max={room.capacityChildren}
                        className="form-control"
                        value={dates.children}
                        onChange={(e) => setDates((d) => ({ ...d, children: e.target.value }))}
                      />
                    </div>
                    {availability && !availability.available && (
                      <p className="text-danger">
                        {availability.message || 'Room is not available for these dates.'}
                      </p>
                    )}
                    <button type="submit" className="btn-half site-button button-lg" disabled={checkingAvailability}>
                      <span>{checkingAvailability ? 'Checking...' : 'Check Availability'}</span><em />
                    </button>
                  </form>
                )}

                {step === 'details' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setStep('review');
                    }}
                  >
                    <p className="text-success">
                      Available &mdash; {nights} night{nights !== 1 ? 's' : ''}
                    </p>
                    <div className="form-group">
                      <input
                        type="text"
                        required
                        placeholder="First name"
                        className="form-control"
                        value={guest.firstName}
                        onChange={(e) => setGuest((g) => ({ ...g, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        required
                        placeholder="Last name"
                        className="form-control"
                        value={guest.lastName}
                        onChange={(e) => setGuest((g) => ({ ...g, lastName: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        required
                        placeholder="Email"
                        className="form-control"
                        value={guest.email}
                        onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="tel"
                        required
                        placeholder="Phone"
                        className="form-control"
                        value={guest.phone}
                        onChange={(e) => setGuest((g) => ({ ...g, phone: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        rows="3"
                        placeholder="Special requests (optional)"
                        className="form-control"
                        value={guest.specialRequests}
                        onChange={(e) => setGuest((g) => ({ ...g, specialRequests: e.target.value }))}
                      />
                    </div>
                    <button type="button" className="site-button btn-half m-r10" onClick={() => setStep('dates')}>
                      <span>Back</span><em />
                    </button>
                    <button type="submit" className="btn-half site-button button-lg">
                      <span>Review Booking</span><em />
                    </button>
                  </form>
                )}

                {step === 'review' && (
                  <div>
                    <p>
                      <strong>{room.name}</strong>
                      <br />
                      {dates.checkIn} &rarr; {dates.checkOut} ({nights} night{nights !== 1 ? 's' : ''})
                      <br />
                      {dates.adults} adult{Number(dates.adults) !== 1 ? 's' : ''}
                      {Number(dates.children) > 0 ? `, ${dates.children} children` : ''}
                    </p>
                    <p>
                      {guest.firstName} {guest.lastName}
                      <br />
                      {guest.email}
                      <br />
                      {guest.phone}
                    </p>
                    <h4>Total: ${estimatedTotal}</h4>
                    {bookingError && <p className="text-danger">{bookingError}</p>}
                    <button type="button" className="site-button btn-half m-r10" onClick={() => setStep('details')}>
                      <span>Back</span><em />
                    </button>
                    <button
                      type="button"
                      className="btn-half site-button button-lg"
                      onClick={submitBooking}
                      disabled={submitting}
                    >
                      <span>{submitting ? 'Booking...' : 'Confirm Booking'}</span><em />
                    </button>
                  </div>
                )}

                {step === 'confirmed' && bookingResult && (
                  <div>
                    <h4 className="text-success">Booking received!</h4>
                    <p>
                      Reference: <strong>{bookingResult.reference}</strong>
                      <br />
                      Status: {bookingResult.status}
                      <br />
                      Total: ${bookingResult.totalAmount.toFixed(2)}
                    </p>
                    <p>A confirmation has been recorded for {guest.email}. Keep your reference for check-in.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
