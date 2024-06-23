import '../styles/ShowFarmStats.css';
import { ENDPOINTS } from '../constants';
import "bootstrap/dist/css/bootstrap.min.css";
import { UserAuth } from '../context/authContext';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { useFarm } from '../context/farmContext';

const FarmOverview = () => {
  const [maxScrollHeight, setMaxScrollHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const { idToken } = UserAuth();
  const { farmData, setFarmData } = useFarm();

  useEffect(() => {
    const windowHeight = window.innerHeight;
    const calculatedMaxScrollHeight = windowHeight - 200;
    setMaxScrollHeight(calculatedMaxScrollHeight);
  }, []);

  const handleClick = (url) => {
    window.location.href = url;
  };

  useEffect(() => {
    const fetchFarmData = async () => {
      if (!idToken) {
        return;
      }

      try {
        const response = await fetch(ENDPOINTS.FARM_OVERVIEW_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${idToken}`,
          },
          credentials: 'include'
        });

        const data = await response.json();
        console.log("API Response:", data.response);
        setFarmData(data.response);
      } catch (error) {
        console.error("Error fetching farm data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmData();
  }, [idToken, setFarmData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxHeight: `${maxScrollHeight}px`, overflowY: 'auto' }}>
      <Container fluid className="mt-5">
        <Row className="justify-content-center">
          <Col
            xs={12} sm={6} md={4} lg={2} xl={2}
            className="mb-4 clickable-col"
            onClick={() => handleClick('https://example.com')} // Replace with actual URL if needed
          >
            <div className="content">
              <div className="icon">
                <i className="fas fa-tractor fa-3x"></i>
              </div>
              <div className="details">
                <p><i className="fas fa-tra"></i>{farmData?.farm_name || "Farm Name Not Available"}</p>
                <p><i className="fas fa-globe"></i> {farmData?.country || "Country Not Available"}</p>
                <p><i className="fas fa-expand-arrows-alt"></i> {farmData?.land_size || "Land Size Not Available"}</p>
                <p><i className="fas fa-seedling"></i> {farmData?.farming_type || "Farming Type Not Available"}</p>
                <p><i className="fas fa-cloud-sun"></i> {farmData?.weather_conditions || "Weather Conditions Not Available"}</p>
                {/* <p><i className="fas fa-cloud-sun"></i> {farmData?.recommendations || "Weather Conditions Not Available"}</p> */}
                <p>Read More....</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FarmOverview;
