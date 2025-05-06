'use client'
import { Button, Col, Divider, Form, Input, notification, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { authenticate } from '@/utils/actions';
import { useRouter } from 'next/navigation';
import ModalReactive from '../auth/modal.reactive';
import { useState } from 'react';
import ModalChangePassword from '../auth/modal.change.password';

const Login = () => {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [changePassword, setChangePassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const { username, password } = values;
            setUserEmail("");
            
            const res = await authenticate(username, password);

            if (res?.error) {
                if (res?.code === 2) {
                    setIsModalOpen(true);
                    setUserEmail(username);
                    return;
                }
                notification.error({
                    message: "Lỗi đăng nhập",
                    description: res?.error
                });
            } else {
                notification.success({
                    message: "Đăng nhập thành công",
                    description: "Đang chuyển hướng đến trang chủ..."
                });
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            notification.error({
                message: "Lỗi đăng nhập",
                description: "Không thể kết nối đến server, vui lòng thử lại sau"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Row justify={"center"} style={{ marginTop: "30px" }}>
                <Col xs={24} md={16} lg={8}>
                    <fieldset style={{
                        padding: "15px",
                        margin: "5px",
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}>
                        <legend>Đăng Nhập</legend>
                        <Form
                            name="basic"
                            onFinish={onFinish}
                            autoComplete="off"
                            layout='vertical'
                        >
                            <Form.Item
                                label="Email"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập email!',
                                    },
                                    {
                                        type: 'email',
                                        message: 'Email không hợp lệ!',
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mật khẩu!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Đăng nhập
                                    </Button>
                                    <Button type='link' onClick={() => setChangePassword(true)}>Quên mật khẩu ?</Button>
                                </div>
                            </Form.Item>
                        </Form>
                        <Link href={"/"}><ArrowLeftOutlined /> Quay lại trang chủ</Link>
                        <Divider />
                        <div style={{ textAlign: "center" }}>
                            Chưa có tài khoản? <Link href={"/auth/register"}>Đăng ký tại đây</Link>
                        </div>
                    </fieldset>
                </Col>
            </Row>
            <ModalReactive
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                userEmail={userEmail}
            />
            <ModalChangePassword
                isModalOpen={changePassword}
                setIsModalOpen={setChangePassword}
            />
        </>
    )
}

export default Login;