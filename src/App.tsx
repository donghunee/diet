import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Typography,
  Divider,
  Space,
  Row,
  Col,
  Radio,
  Slider,
  Button,
  Tabs,
  Tooltip,
} from 'antd';
import {
  CalculatorOutlined,
  LockOutlined,
  UnlockOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import './App.css';

const { Title, Text } = Typography;

// 활동량 enum 정의
enum ActivityLevel {
  SEDENTARY = 1.2,
  LIGHTLY_ACTIVE = 1.375,
  MODERATELY_ACTIVE = 1.55,
  VERY_ACTIVE = 1.725,
}

const MacroCalculator: React.FC = () => {
  // 로컬 스토리지에서 값을 가져오는 함수
  const getStoredValue = <T,>(key: string, defaultValue: T): T => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  };

  const [age, setAge] = useState(() => getStoredValue('age', 33));
  const [height, setHeight] = useState(() => getStoredValue('height', 179));
  const [weight, setWeight] = useState(() => getStoredValue('weight', 67));
  const [gender, setGender] = useState<'male' | 'female'>(() =>
    getStoredValue('gender', 'male')
  );
  const [activity, setActivity] = useState<ActivityLevel>(() =>
    getStoredValue('activity', ActivityLevel.LIGHTLY_ACTIVE)
  );
  const [goal, setGoal] = useState<'maintain' | 'cut' | 'bulk'>(() =>
    getStoredValue('goal', 'cut')
  );
  const [customRatio, setCustomRatio] = useState(() =>
    getStoredValue('customRatio', false)
  );
  const [carbRatio, setCarbRatio] = useState(() =>
    getStoredValue('carbRatio', 50)
  );
  const [proteinRatio, setProteinRatio] = useState(() =>
    getStoredValue('proteinRatio', 30)
  );
  const [fatRatio, setFatRatio] = useState(() =>
    getStoredValue('fatRatio', 20)
  );
  const [lockedMacro, setLockedMacro] = useState<
    'carb' | 'protein' | 'fat' | null
  >(() => getStoredValue('lockedMacro', null));
  const [inputMode, setInputMode] = useState<'ratio' | 'grams'>(() =>
    getStoredValue('inputMode', 'ratio')
  );
  const [carbGrams, setCarbGrams] = useState(() =>
    getStoredValue('carbGrams', 0)
  );
  const [proteinGrams, setProteinGrams] = useState(() =>
    getStoredValue('proteinGrams', 0)
  );
  const [fatGrams, setFatGrams] = useState(() => getStoredValue('fatGrams', 0));
  const [isUpdatingFromCalc, setIsUpdatingFromCalc] = useState(false);

  // 값이 변경될 때마다 로컬 스토리지에 저장하는 함수
  const saveToLocalStorage = <T,>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // 값이 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    saveToLocalStorage('age', age);
  }, [age]);

  useEffect(() => {
    saveToLocalStorage('height', height);
  }, [height]);

  useEffect(() => {
    saveToLocalStorage('weight', weight);
  }, [weight]);

  useEffect(() => {
    saveToLocalStorage('gender', gender);
  }, [gender]);

  useEffect(() => {
    saveToLocalStorage('activity', activity);
  }, [activity]);

  useEffect(() => {
    saveToLocalStorage('goal', goal);
  }, [goal]);

  useEffect(() => {
    saveToLocalStorage('customRatio', customRatio);
  }, [customRatio]);

  useEffect(() => {
    saveToLocalStorage('carbRatio', carbRatio);
  }, [carbRatio]);

  useEffect(() => {
    saveToLocalStorage('proteinRatio', proteinRatio);
  }, [proteinRatio]);

  useEffect(() => {
    saveToLocalStorage('fatRatio', fatRatio);
  }, [fatRatio]);

  useEffect(() => {
    saveToLocalStorage('lockedMacro', lockedMacro);
  }, [lockedMacro]);

  useEffect(() => {
    saveToLocalStorage('inputMode', inputMode);
  }, [inputMode]);

  useEffect(() => {
    saveToLocalStorage('carbGrams', carbGrams);
  }, [carbGrams]);

  useEffect(() => {
    saveToLocalStorage('proteinGrams', proteinGrams);
  }, [proteinGrams]);

  useEffect(() => {
    saveToLocalStorage('fatGrams', fatGrams);
  }, [fatGrams]);

  const handleCarbChange = (value: number) => {
    setCarbRatio(value);

    if (lockedMacro === 'protein') {
      // 단백질이 고정된 경우, 지방만 조정
      setFatRatio(Math.round((100 - value - proteinRatio) * 10) / 10);
    } else if (lockedMacro === 'fat') {
      // 지방이 고정된 경우, 단백질만 조정
      setProteinRatio(Math.round((100 - value - fatRatio) * 10) / 10);
    } else {
      // 고정된 것이 없거나 탄수화물이 고정된 경우 (탄수화물이 고정된 경우는 여기서 변경 불가)
      // 단백질과 지방 비율 자동 조정 (단백질:지방 = 3:2 비율 유지)
      const remaining = 100 - value;
      const newProteinRatio = Math.round(remaining * 0.6 * 10) / 10;
      const newFatRatio = Math.round(remaining * 0.4 * 10) / 10;
      setProteinRatio(newProteinRatio);
      setFatRatio(newFatRatio);
    }
  };

  const handleProteinChange = (value: number) => {
    setProteinRatio(value);

    if (lockedMacro === 'carb') {
      // 탄수화물이 고정된 경우, 지방만 조정
      setFatRatio(Math.round((100 - value - carbRatio) * 10) / 10);
    } else if (lockedMacro === 'fat') {
      // 지방이 고정된 경우, 탄수화물만 조정
      setCarbRatio(Math.round((100 - value - fatRatio) * 10) / 10);
    } else {
      // 고정된 것이 없거나 단백질이 고정된 경우 (단백질이 고정된 경우는 여기서 변경 불가)
      // 탄수화물과 지방 비율 조정
      const remaining = 100 - value;
      if (carbRatio + fatRatio > remaining) {
        // 탄수화물:지방 비율 유지하면서 조정
        const totalOld = carbRatio + fatRatio;
        const newCarbRatio =
          Math.round((carbRatio / totalOld) * remaining * 10) / 10;
        const newFatRatio = Math.round((100 - value - newCarbRatio) * 10) / 10;
        setCarbRatio(newCarbRatio);
        setFatRatio(newFatRatio);
      } else {
        setFatRatio(100 - value - carbRatio);
      }
    }
  };

  const handleFatChange = (value: number) => {
    setFatRatio(value);

    if (lockedMacro === 'carb') {
      // 탄수화물이 고정된 경우, 단백질만 조정
      setProteinRatio(Math.round((100 - value - carbRatio) * 10) / 10);
    } else if (lockedMacro === 'protein') {
      // 단백질이 고정된 경우, 탄수화물만 조정
      setCarbRatio(Math.round((100 - value - proteinRatio) * 10) / 10);
    } else {
      // 고정된 것이 없거나 지방이 고정된 경우 (지방이 고정된 경우는 여기서 변경 불가)
      // 탄수화물과 단백질 비율 조정
      const remaining = 100 - value;
      if (carbRatio + proteinRatio > remaining) {
        // 탄수화물:단백질 비율 유지하면서 조정
        const totalOld = carbRatio + proteinRatio;
        const newCarbRatio =
          Math.round((carbRatio / totalOld) * remaining * 10) / 10;
        const newProteinRatio =
          Math.round((100 - value - newCarbRatio) * 10) / 10;
        setCarbRatio(newCarbRatio);
        setProteinRatio(newProteinRatio);
      } else {
        setCarbRatio(100 - value - proteinRatio);
      }
    }
  };

  const handleCarbGramsChange = (value: number | null) => {
    if (value === null) return;

    setCarbGrams(value);
    const result = calculateMacros();
    const totalCalories = result.calories;

    // 탄수화물 칼로리 계산
    const carbCalories = value * 4;

    // 비율 업데이트
    const newCarbRatio =
      Math.round((carbCalories / totalCalories) * 100 * 10) / 10;

    // 나머지 비율 조정
    if (lockedMacro === 'protein') {
      setFatRatio(Math.round((100 - newCarbRatio - proteinRatio) * 10) / 10);
      setCarbRatio(newCarbRatio);
    } else if (lockedMacro === 'fat') {
      setProteinRatio(Math.round((100 - newCarbRatio - fatRatio) * 10) / 10);
      setCarbRatio(newCarbRatio);
    } else {
      const remaining = 100 - newCarbRatio;
      const newProteinRatio = Math.round(remaining * 0.6 * 10) / 10;
      const newFatRatio = Math.round(remaining * 0.4 * 10) / 10;

      setCarbRatio(newCarbRatio);
      setProteinRatio(newProteinRatio);
      setFatRatio(newFatRatio);
    }
  };

  const handleProteinGramsChange = (value: number | null) => {
    if (value === null) return;

    setProteinGrams(value);
    const result = calculateMacros();
    const totalCalories = result.calories;

    // 단백질 칼로리 계산
    const proteinCalories = value * 4;

    // 비율 업데이트
    const newProteinRatio =
      Math.round((proteinCalories / totalCalories) * 100 * 10) / 10;

    // 나머지 비율 조정
    if (lockedMacro === 'carb') {
      setFatRatio(Math.round((100 - carbRatio - newProteinRatio) * 10) / 10);
      setProteinRatio(newProteinRatio);
    } else if (lockedMacro === 'fat') {
      setCarbRatio(Math.round((100 - newProteinRatio - fatRatio) * 10) / 10);
      setProteinRatio(newProteinRatio);
    } else {
      const remaining = 100 - newProteinRatio;
      if (carbRatio + fatRatio > remaining) {
        const totalOld = carbRatio + fatRatio;
        const newCarbRatio =
          Math.round((carbRatio / totalOld) * remaining * 10) / 10;
        const newFatRatio =
          Math.round((100 - newProteinRatio - newCarbRatio) * 10) / 10;

        setProteinRatio(newProteinRatio);
        setCarbRatio(newCarbRatio);
        setFatRatio(newFatRatio);
      } else {
        setProteinRatio(newProteinRatio);
        setFatRatio(100 - newProteinRatio - carbRatio);
      }
    }
  };

  const handleFatGramsChange = (value: number | null) => {
    if (value === null) return;

    setFatGrams(value);
    const result = calculateMacros();
    const totalCalories = result.calories;

    // 지방 칼로리 계산
    const fatCalories = value * 9;

    // 비율 업데이트
    const newFatRatio =
      Math.round((fatCalories / totalCalories) * 100 * 10) / 10;

    // 나머지 비율 조정
    if (lockedMacro === 'carb') {
      setProteinRatio(Math.round((100 - carbRatio - newFatRatio) * 10) / 10);
      setFatRatio(newFatRatio);
    } else if (lockedMacro === 'protein') {
      setCarbRatio(Math.round((100 - proteinRatio - newFatRatio) * 10) / 10);
      setFatRatio(newFatRatio);
    } else {
      const remaining = 100 - newFatRatio;
      if (carbRatio + proteinRatio > remaining) {
        const totalOld = carbRatio + proteinRatio;
        const newCarbRatio =
          Math.round((carbRatio / totalOld) * remaining * 10) / 10;
        const newProteinRatio =
          Math.round((100 - newFatRatio - newCarbRatio) * 10) / 10;

        setFatRatio(newFatRatio);
        setCarbRatio(newCarbRatio);
        setProteinRatio(newProteinRatio);
      } else {
        setFatRatio(newFatRatio);
        setCarbRatio(100 - proteinRatio - newFatRatio);
      }
    }
  };

  const toggleLock = (macro: 'carb' | 'protein' | 'fat') => {
    if (lockedMacro === macro) {
      setLockedMacro(null);
    } else {
      setLockedMacro(macro);
    }
  };

  const calculateMacros = () => {
    // 1. BMR 계산 (Mifflin-St Jeor)
    const bmr =
      gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    // 2. TDEE 계산
    let tdee = bmr * activity;

    // 3. 목표에 따라 칼로리 조절
    if (goal === 'cut') tdee -= 500; // 다이어트는 TDEE에서 500 칼로리 감소
    if (goal === 'bulk') tdee += 200; // 벌크업은 TDEE에서 200 칼로리 증가

    const calories = Math.round(tdee);

    // 4. 매크로 비율 설정
    const carbsRatioDecimal = carbRatio / 100;
    const proteinRatioDecimal = proteinRatio / 100;
    const fatRatioDecimal = fatRatio / 100;

    const carbs = Math.round((calories * carbsRatioDecimal) / 4); // 1g = 4kcal
    const protein = Math.round((calories * proteinRatioDecimal) / 4);
    const fat = Math.round((calories * fatRatioDecimal) / 9); // 1g = 9kcal

    // 그램 값 업데이트 (무한 루프 방지)
    if (!isUpdatingFromCalc) {
      setIsUpdatingFromCalc(true);
      setCarbGrams(carbs);
      setProteinGrams(protein);
      setFatGrams(fat);
      setTimeout(() => setIsUpdatingFromCalc(false), 0);
    }

    return {
      calories,
      carbs,
      protein,
      fat,
      bmr: Math.round(bmr),
      tdee: Math.round(bmr * activity),
    };
  };

  // 기본 정보가 변경될 때마다 매크로 계산
  useEffect(() => {
    calculateMacros();
  }, [
    age,
    height,
    weight,
    gender,
    activity,
    goal,
    carbRatio,
    proteinRatio,
    fatRatio,
  ]);

  // 기본 비율 선택 시 5:3:2 비율로 설정
  useEffect(() => {
    if (!customRatio) {
      setCarbRatio(50);
      setProteinRatio(30);
      setFatRatio(20);
    }
  }, [customRatio]);

  const result = calculateMacros();

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 8px' }}>
      <Card
        bordered={false}
        style={{
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            <CalculatorOutlined style={{ marginRight: '8px' }} />
            탄단지 매크로 계산기
          </Title>

          <Form layout="vertical" style={{ width: '100%' }}>
            <Form.Item
              label={<Text strong>성별</Text>}
              style={{ marginBottom: '12px' }}
            >
              <Radio.Group
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                size="large"
                style={{ width: '100%' }}
              >
                <Radio.Button
                  value="male"
                  style={{ width: '50%', textAlign: 'center' }}
                >
                  남성
                </Radio.Button>
                <Radio.Button
                  value="female"
                  style={{ width: '50%', textAlign: 'center' }}
                >
                  여성
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label={<Text strong>만 나이</Text>}
              style={{ marginBottom: '12px' }}
            >
              <InputNumber
                value={age}
                onChange={(value) => setAge(Number(value))}
                style={{ width: '100%' }}
                size="large"
                min={1}
                max={120}
              />
            </Form.Item>

            <Form.Item
              label={<Text strong>키(cm)</Text>}
              style={{ marginBottom: '12px' }}
            >
              <InputNumber
                value={height}
                onChange={(value) => setHeight(Number(value))}
                style={{ width: '100%' }}
                size="large"
                min={100}
                max={250}
              />
            </Form.Item>

            <Form.Item
              label={<Text strong>몸무게(kg)</Text>}
              style={{ marginBottom: '12px' }}
            >
              <InputNumber
                value={weight}
                onChange={(value) => setWeight(Number(value))}
                style={{ width: '100%' }}
                size="large"
                min={30}
                max={200}
              />
            </Form.Item>

            <Form.Item
              label={<Text strong>활동량</Text>}
              style={{ marginBottom: '12px' }}
            >
              <Radio.Group
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                size="large"
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value={ActivityLevel.SEDENTARY}>
                    정적 (거의 좌식 생활을 하고 운동 안함)
                  </Radio>
                  <Radio value={ActivityLevel.LIGHTLY_ACTIVE}>
                    가벼운 활동 (활동량이 보통이거나 주 1-3회 운동)
                  </Radio>
                  <Radio value={ActivityLevel.MODERATELY_ACTIVE}>
                    보통 (활동량이 다소 많거나 주 3-5회 운동)
                  </Radio>
                  <Radio value={ActivityLevel.VERY_ACTIVE}>
                    활발한 활동 (활동량이 많거나 주 6-7회 운동)
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item style={{ marginBottom: '12px' }}>
              <Card
                style={{
                  borderRadius: '8px',
                  background: '#f9f9f9',
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text strong>기초 대사량 (BMR)</Text>
                    <Tooltip title="Mifflin-St Jeor 공식을 사용하여 계산한 기초 대사량입니다. 아무 활동도 하지 않고 누워만 있을 때 소모되는 칼로리입니다.">
                      <InfoCircleOutlined style={{ color: '#1677ff' }} />
                    </Tooltip>
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1677ff',
                    }}
                  >
                    {result.bmr} kcal
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text strong>활동 대사량 (TDEE)</Text>
                    <Tooltip title="일상 활동을 포함한 하루 총 소모 칼로리입니다. 체중 유지를 위해 필요한 칼로리양입니다.">
                      <InfoCircleOutlined style={{ color: '#1677ff' }} />
                    </Tooltip>
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1677ff',
                    }}
                  >
                    {result.tdee} kcal
                  </div>

                  {/* <Paragraph
                    style={{
                      fontSize: '12px',
                      marginTop: '12px',
                      color: '#666',
                    }}
                  >
                    * 기초 대사량은 Mifflin-St Jeor 공식(1990)을 사용하여
                    계산됩니다.
                    <br />* 활동 대사량은 기초 대사량에 활동 계수를 곱하여
                    산출됩니다.
                  </Paragraph> */}
                </Space>
              </Card>
            </Form.Item>
            <Divider />
            <Form.Item
              label={<Text strong>목표</Text>}
              style={{ marginBottom: '12px' }}
            >
              <Radio.Group
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                size="large"
                style={{ width: '100%' }}
              >
                <Radio.Button
                  value="maintain"
                  style={{ width: '33.33%', textAlign: 'center' }}
                >
                  유지
                </Radio.Button>
                <Radio.Button
                  value="cut"
                  style={{ width: '33.33%', textAlign: 'center' }}
                >
                  다이어트
                </Radio.Button>
                <Radio.Button
                  value="bulk"
                  style={{ width: '33.33%', textAlign: 'center' }}
                >
                  벌크업
                </Radio.Button>
              </Radio.Group>
              <div
                style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}
              >
                {goal === 'maintain' && (
                  <Text type="secondary">
                    • 유지: TDEE와 동일한 칼로리 섭취로 현재 체중 유지
                  </Text>
                )}
                {goal === 'cut' && (
                  <Text type="secondary">
                    • 다이어트: TDEE에서 500 칼로리 감소로 체지방 감소
                  </Text>
                )}
                {goal === 'bulk' && (
                  <Text type="secondary">
                    • 벌크업: TDEE에서 200 칼로리 증가로 근육량 증가
                  </Text>
                )}
              </div>
            </Form.Item>

            <Card
              className="macro-result"
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                border: '1px solid #e6f7ff',
                width: '100%',
              }}
            >
              <Title level={5} style={{ marginTop: 0, color: '#1677ff' }}>
                🔥 하루 권장 섭취량
              </Title>

              <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} md={24}>
                  <Card style={{ borderRadius: '8px', background: 'white' }}>
                    <Text strong style={{ fontSize: '16px' }}>
                      칼로리
                    </Text>
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#1677ff',
                      }}
                    >
                      {result.calories} kcal
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={8}>
                  <Card
                    style={{
                      borderRadius: '8px',
                      background: 'white',
                      textAlign: 'center',
                      height: '100%',
                    }}
                  >
                    <Text>🍚 탄수화물</Text>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>
                      {result.carbs}g
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={8}>
                  <Card
                    style={{
                      borderRadius: '8px',
                      background: 'white',
                      textAlign: 'center',
                      height: '100%',
                    }}
                  >
                    <Text>🥩 단백질</Text>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>
                      {result.protein}g
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={8}>
                  <Card
                    style={{
                      borderRadius: '8px',
                      background: 'white',
                      textAlign: 'center',
                      height: '100%',
                    }}
                  >
                    <Text>🥑 지방</Text>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>
                      {result.fat}g
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
            <Divider />
            <Form.Item
              label={<Text strong>탄단지 비율 설정</Text>}
              style={{ marginBottom: '12px' }}
            >
              <Radio.Group
                value={customRatio}
                onChange={(e) => setCustomRatio(e.target.value)}
                style={{ marginBottom: '16px' }}
              >
                <Radio value={false}>
                  기본 비율 (탄수화물 50%, 단백질 30%, 지방 20%)
                </Radio>
                <Radio value={true}>직접 설정</Radio>
              </Radio.Group>
              {!customRatio && (
                <div
                  style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}
                >
                  <Text type="secondary">
                    • 기본 비율(50:30:20)은 일반적인 건강한 식단 구성에
                    적합합니다.
                  </Text>
                  <br />
                  <Text type="secondary">
                    • 탄수화물: 에너지원으로 운동 성능을 유지하는 데 중요합니다.
                  </Text>
                  <br />
                  <Text type="secondary">
                    • 단백질: 근육 회복과 성장에 필수적이며, 체중 1kg당
                    1.6-2.2g이 권장됩니다.
                  </Text>
                  <br />
                  <Text type="secondary">
                    • 지방: 호르몬 생성과 영양소 흡수에 필요하며, 최소 체중의
                    15-20%가 권장됩니다.
                  </Text>
                </div>
              )}

              {customRatio && (
                <Card style={{ marginTop: '12px', borderRadius: '8px' }}>
                  <Tabs
                    activeKey={inputMode}
                    onChange={(key) => setInputMode(key as 'ratio' | 'grams')}
                    items={[
                      {
                        key: 'ratio',
                        label: '비율로 설정',
                        children: (
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Text>탄수화물: {carbRatio}%</Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={
                                    lockedMacro === 'carb' ? (
                                      <LockOutlined />
                                    ) : (
                                      <UnlockOutlined />
                                    )
                                  }
                                  onClick={() => toggleLock('carb')}
                                  style={{
                                    marginLeft: '8px',
                                    color:
                                      lockedMacro === 'carb'
                                        ? '#1677ff'
                                        : 'inherit',
                                  }}
                                />
                              </div>
                              <div>
                                <Text type="secondary">
                                  {Math.round(
                                    (result.calories * carbRatio) / 100 / 4
                                  )}
                                  g
                                </Text>
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: '8px' }}
                                >
                                  (
                                  {Math.round(
                                    (result.calories * carbRatio) / 100
                                  )}
                                  kcal)
                                </Text>
                              </div>
                            </div>
                            <Slider
                              min={10}
                              max={70}
                              value={carbRatio}
                              onChange={handleCarbChange}
                              disabled={lockedMacro === 'carb'}
                            />

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '12px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Text>단백질: {proteinRatio}%</Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={
                                    lockedMacro === 'protein' ? (
                                      <LockOutlined />
                                    ) : (
                                      <UnlockOutlined />
                                    )
                                  }
                                  onClick={() => toggleLock('protein')}
                                  style={{
                                    marginLeft: '8px',
                                    color:
                                      lockedMacro === 'protein'
                                        ? '#1677ff'
                                        : 'inherit',
                                  }}
                                />
                              </div>
                              <div>
                                <Text type="secondary">
                                  {Math.round(
                                    (result.calories * proteinRatio) / 100 / 4
                                  )}
                                  g
                                </Text>
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: '8px' }}
                                >
                                  (
                                  {Math.round(
                                    (result.calories * proteinRatio) / 100
                                  )}
                                  kcal)
                                </Text>
                              </div>
                            </div>
                            <Slider
                              min={10}
                              max={60}
                              value={proteinRatio}
                              onChange={handleProteinChange}
                              disabled={lockedMacro === 'protein'}
                            />

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '12px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Text>지방: {fatRatio}%</Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={
                                    lockedMacro === 'fat' ? (
                                      <LockOutlined />
                                    ) : (
                                      <UnlockOutlined />
                                    )
                                  }
                                  onClick={() => toggleLock('fat')}
                                  style={{
                                    marginLeft: '8px',
                                    color:
                                      lockedMacro === 'fat'
                                        ? '#1677ff'
                                        : 'inherit',
                                  }}
                                />
                              </div>
                              <div>
                                <Text type="secondary">
                                  {Math.round(
                                    (result.calories * fatRatio) / 100 / 9
                                  )}
                                  g
                                </Text>
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: '8px' }}
                                >
                                  (
                                  {Math.round(
                                    (result.calories * fatRatio) / 100
                                  )}
                                  kcal)
                                </Text>
                              </div>
                            </div>
                            <Slider
                              min={10}
                              max={50}
                              value={fatRatio}
                              onChange={handleFatChange}
                              disabled={lockedMacro === 'fat'}
                            />
                            <div style={{ marginTop: '8px' }}>
                              <Text type="secondary">
                                총합: {carbRatio + proteinRatio + fatRatio}%
                                (100%가 되어야 합니다)
                              </Text>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        key: 'grams',
                        label: '그램(g)으로 설정',
                        children: (
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Text>탄수화물 (g)</Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={
                                    lockedMacro === 'carb' ? (
                                      <LockOutlined />
                                    ) : (
                                      <UnlockOutlined />
                                    )
                                  }
                                  onClick={() => toggleLock('carb')}
                                  style={{
                                    marginLeft: '8px',
                                    color:
                                      lockedMacro === 'carb'
                                        ? '#1677ff'
                                        : 'inherit',
                                  }}
                                />
                              </div>
                              <div>
                                <Text type="secondary">
                                  ({Math.round(carbGrams * 4)}kcal, {carbRatio}
                                  %)
                                </Text>
                              </div>
                            </div>
                            <InputNumber
                              min={10}
                              max={500}
                              value={carbGrams}
                              onChange={handleCarbGramsChange}
                              disabled={lockedMacro === 'carb'}
                              style={{ width: '100%' }}
                            />

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '12px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Text>단백질 (g)</Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={
                                    lockedMacro === 'protein' ? (
                                      <LockOutlined />
                                    ) : (
                                      <UnlockOutlined />
                                    )
                                  }
                                  onClick={() => toggleLock('protein')}
                                  style={{
                                    marginLeft: '8px',
                                    color:
                                      lockedMacro === 'protein'
                                        ? '#1677ff'
                                        : 'inherit',
                                  }}
                                />
                              </div>
                              <div>
                                <Text type="secondary">
                                  ({Math.round(proteinGrams * 4)}kcal,{' '}
                                  {proteinRatio}%)
                                </Text>
                              </div>
                            </div>
                            <InputNumber
                              min={10}
                              max={300}
                              value={proteinGrams}
                              onChange={handleProteinGramsChange}
                              disabled={lockedMacro === 'protein'}
                              style={{ width: '100%' }}
                            />

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '12px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <Text>지방 (g)</Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={
                                    lockedMacro === 'fat' ? (
                                      <LockOutlined />
                                    ) : (
                                      <UnlockOutlined />
                                    )
                                  }
                                  onClick={() => toggleLock('fat')}
                                  style={{
                                    marginLeft: '8px',
                                    color:
                                      lockedMacro === 'fat'
                                        ? '#1677ff'
                                        : 'inherit',
                                  }}
                                />
                              </div>
                              <div>
                                <Text type="secondary">
                                  ({Math.round(fatGrams * 9)}kcal, {fatRatio}%)
                                </Text>
                              </div>
                            </div>
                            <InputNumber
                              min={5}
                              max={200}
                              value={fatGrams}
                              onChange={handleFatGramsChange}
                              disabled={lockedMacro === 'fat'}
                              style={{ width: '100%' }}
                            />

                            <div style={{ marginTop: '8px' }}>
                              <Text type="secondary">
                                총 칼로리:{' '}
                                {Math.round(
                                  carbGrams * 4 +
                                    proteinGrams * 4 +
                                    fatGrams * 9
                                )}
                                kcal (목표: {result.calories}kcal)
                              </Text>
                            </div>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>
              )}
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default MacroCalculator;
