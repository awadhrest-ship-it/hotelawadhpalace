import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageBanner from '../components/PageBanner';
import RoomCard from '../components/RoomCard';
import api from '../api/client';

export default function Rooms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Admin > Settings > Page Banner Images ("Rooms & Suites").
  const [pageBanner, setPageBanner] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/settings')
      .then(({ data }) => active && setPageBanner(data.data?.pageBanners?.rooms))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const request =
      checkIn && checkOut
        ? api.get('/rooms/search', { params: { checkIn, checkOut, guests: guests || 1 } })
        : api.get('/rooms');

    request
      .then(({ data }) => active && setRooms(data.data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [checkIn, checkOut, guests]);

  const onFilterSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const next = {};
    if (form.get('checkIn')) next.checkIn = form.get('checkIn');
    if (form.get('checkOut')) next.checkOut = form.get('checkOut');
    if (form.get('guests')) next.guests = form.get('guests');
    setSearchParams(next);
  };

  return (
    <>
      <PageBanner title="Rooms & Suites" crumbs={[{ label: 'Rooms' }]} image={pageBanner?.url || '/assets/images/banner/2.jpg'} />

      <div className="section-full p-tb80 bg-white">
        <div className="container">
          <form className="row m-b40" onSubmit={onFilterSubmit}>
            <div className="col-md-3 col-sm-6 m-b15">
              <label>Check-in</label>
              <input type="date" name="checkIn" defaultValue={checkIn} className="form-control" />
            </div>
            <div className="col-md-3 col-sm-6 m-b15">
              <label>Check-out</label>
              <input type="date" name="checkOut" defaultValue={checkOut} className="form-control" />
            </div>
            <div className="col-md-2 col-sm-6 m-b15">
              <label>Guests</label>
              <input type="number" min="1" name="guests" defaultValue={guests} className="form-control" />
            </div>
            <div className="col-md-2 col-sm-6 m-b15 d-flex align-items-end">
              <button type="submit" className="site-button-secondry btn-half">
                <span>Search</span><em />
              </button>
            </div>
            {(checkIn || checkOut || guests) && (
              <div className="col-md-2 d-flex align-items-end m-b15">
                <button
                  type="button"
                  className="site-button btn-half"
                  onClick={() => setSearchParams({})}
                >
                  <span>Clear</span><em />
                </button>
              </div>
            )}
          </form>

          {loading && <p className="text-center">Loading rooms&hellip;</p>}
          {error && <p className="text-center text-danger">{error}</p>}
          {!loading && !error && rooms.length === 0 && (
            <p className="text-center">
              No rooms available for the selected dates. Try a different date range.
            </p>
          )}

          <div className="row">
            {rooms.map((room) => (
              <div className="col-lg-4 col-md-6 m-b30" key={room._id}>
                <RoomCard room={room} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}