import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../../hooks/axios/auth'; 
import { setLocalData  } from '../../config/localStrage';
import Signup from './component/Signup';
import LoginForm  from './component/LoginForm';
import Swal from 'sweetalert2';

import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap';
import { FcGoogle } from 'react-icons/fc';
import './LoginPage.css';

const LoginPage = ({ setUserData }) => {
  const [isClient, setIsClient] = useState(false);
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleIsClient = (e) => {
    if (e === "client") {
      setIsClient(true);
    } else setIsClient(false);
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const authorizationCode = url.searchParams.get('code');
    
    if (authorizationCode) {
      auth.oauth(authorizationCode)
      .then(res => {
        setEmail(res.data.email);
        setShow(true);
      })
    }
  },[]);

  const googleOath = async () => {
    //서버에서 url을 받아와서 동의 페이지로 이동
    window.location.href = await auth.oauthLink();
  }

  const sendLoginData = async (loginData) => {
    loginData.isClient = isClient;
    
    const { userId, password } = loginData;
    try { 
      if ( userId && password ) {
      const result = await auth.login(loginData);
        if (result) {
          const { user, jwt_accessToken, isClient } = result.data;  
          if (user && jwt_accessToken && typeof(isClient) === 'boolean') {   
            setLocalData("accessToken", jwt_accessToken);
            setLocalData("isClient", isClient);
            setUserData(user);
            navigate('/');
          }
        }
      } else {
        await Swal.fire({
          icon: 'warning',
          title: '아이디와 비밀번호를 입력해주세요.',
        })
      }
    } catch (err) {
      await Swal.fire({
        icon: 'warning',
        title: '아이디 또는 비밀번호가 잘못되었습니다.',
      })
    }
  }
  
  return (
    <>
      <Container className='loginPage_container'>
        <Row>
          <Col xl={2}/>
            <Col xl={8}>
              <Tabs
                className='login_tab'
                defaultActiveKey="supplier"
                onSelect={handleIsClient}
                justify
              >
                <Tab 
                  eventKey="supplier" 
                  title="크리에이터"
                >
                  <LoginForm sendLoginData={sendLoginData}/>
                </Tab>
                <Tab 
                  eventKey="client" 
                  title="광고주"
                >
                  <LoginForm sendLoginData={sendLoginData} />
                </Tab>
              </Tabs>
              <Row className='login_buttonArea'>
                <Col xl={3}/>
                <Col xl={4}>
                  <button className="login_googleSignupButton" onClick={googleOath}>
                    <FcGoogle className='login_googleIcon' size={30}/>  
                    Google 계정으로 간편회원가입
                  </button>
                </Col>
                <Col xl={5}/>
              </Row>
            </Col>
          <Col xl={2}/>
        </Row>
      </Container>
      <Signup 
        email={email}
        show={show} 
        setShow={setShow}
      />
    </>
  );
}


export default LoginPage;