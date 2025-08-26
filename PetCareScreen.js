import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  Alert,
  Animated,
  Dimensions,
  TextInput,
  Pressable,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

export default function PetCareScreen({ 
  selectedPet, 
  onBack,
  dailyRewardClaimed,
  onDailyRewardClaimed,
  todayStats,
  setTodayStats,
  petQuoteTriggered,
  setPetQuoteTriggered,
  isDarkTheme,
  language
}) {
  // 持久化鍵值
  const PERSIST_KEYS = {
    transactions: 'PERSIST_TRANSACTIONS',
    savedMoney: 'PERSIST_SAVED_MONEY',
    dreamPlans: 'PERSIST_DREAM_PLANS',
    selectedDreamPlanId: 'PERSIST_SELECTED_DREAM_PLAN_ID',
    selectedWithdrawDreamPlanId: 'PERSIST_SELECTED_WITHDRAW_DREAM_PLAN_ID',
    petStatus: 'PERSIST_PET_STATUS',
    dailyCounters: 'PERSIST_DAILY_COUNTERS',
    walkStreak: 'PERSIST_WALK_STREAK',
    backpack: 'PERSIST_BACKPACK',
    savingsGoals: 'PERSIST_SAVINGS_GOALS',
    accountingSearchText: 'PERSIST_ACCOUNTING_SEARCH_TEXT',
    accountingSelectedMonth: 'PERSIST_ACCOUNTING_SELECTED_MONTH',
    accountingSelectedCategories: 'PERSIST_ACCOUNTING_SELECTED_CATEGORIES',
    showAccountingPage: 'PERSIST_SHOW_ACCOUNTING_PAGE',
    showSavingsPage: 'PERSIST_SHOW_SAVINGS_PAGE',
    showDreamSavingsPage: 'PERSIST_SHOW_DREAM_SAVINGS_PAGE',
    showGoalEditPage: 'PERSIST_SHOW_GOAL_EDIT_PAGE',
  };

  // 資料是否已完成還原（避免初始化時覆寫儲存資料）
  const hydratedRef = useRef(false);

  const safeParseJson = (text, fallback = null) => {
    try {
      if (text === null || text === undefined) return fallback;
      return JSON.parse(text);
    } catch (e) {
      console.warn('JSON parse error:', e);
      return fallback;
    }
  };

  const saveJson = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('AsyncStorage save error for', key, e);
    }
  };
  // 基本狀態
  const [petStatus, setPetStatus] = useState({
    hunger: 30,
    cleanliness: 30,
    affection: 30,
  });

  const [backpack, setBackpack] = useState({
    food: {
      'nutrition_meat': { name: '營養肉乾', quantity: 2 },
      'delicious_cookie': { name: '美味餅乾', quantity: 1 },
      'healthy_fruit': { name: '健康水果', quantity: 0 },
    },
    toys: {
      'plush_toy': { name: '絨毛玩偶', quantity: 1 },
      'bouncy_ball': { name: '彈跳球', quantity: 0 },
      'chew_bone': { name: '磨牙骨', quantity: 1 },
      'feather_wand': { name: '逗貓棒', quantity: 0 },
    },
    grooming: {
      'bath_service': { name: '洗澡', quantity: 0 },
      'ear_cleaning': { name: '耳朵清潔', quantity: 0 },
      'teeth_brushing': { name: '刷牙', quantity: 0 },
      'spa_treatment': { name: 'SPA護膚', quantity: 0 },
    },
    special: {
      'energy_potion': { name: '能量瓶', quantity: 0 },
      'mystery_box': { name: '神秘禮盒', quantity: 0 },
      'lucky_star': { name: '幸運星', quantity: 0 },
    },
    iceCoins: 50,
  });

  // 每日互動計數器
  const [dailyCounters, setDailyCounters] = useState({
    feedCount: 0,
    cleanCount: 0,
    petCount: 0,
    walkCount: 0,
    perfectStatusRewardClaimed: false, // 追蹤今日是否已領取完美狀態獎勵
    petInteractionCount: 0, // 新增：摸摸頭互動次數
    petInteractionCoins: 0, // 新增：摸摸頭獲得的冰冰幣
    petInteractionAffection: 0, // 新增：摸摸頭獲得的親密度
    lastResetDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString(),
  });

  // 連續散步記錄
  const [walkStreak, setWalkStreak] = useState({
    currentStreak: 0,
    lastWalkDate: null,
  });

  // 商店商品資料
  const [shopItems] = useState({
    food: [
      { id: 'nutrition_meat', name: '營養肉乾', price: 15, icon: '🥩', description: '高營養價值' },
      { id: 'delicious_cookie', name: '美味餅乾', price: 20, icon: '🍪', description: '寵物最愛' },
      { id: 'healthy_fruit', name: '健康水果', price: 25, icon: '🍎', description: '天然健康' },
    ],
    toys: [
      { id: 'plush_toy', name: '絨毛玩偶', price: 12, icon: '🧸', description: '柔軟可愛' },
      { id: 'bouncy_ball', name: '彈跳球', price: 18, icon: '⚾', description: '歡樂滾動' },
      { id: 'chew_bone', name: '磨牙骨', price: 22, icon: '🦴', description: '健康磨牙' },
      { id: 'feather_wand', name: '逗貓棒', price: 28, icon: '🪶', description: '互動樂趣' },
    ],
    grooming: [
      { id: 'bath_service', name: '洗澡', price: 10, icon: '🛁', description: '專業洗澡服務' },
      { id: 'ear_cleaning', name: '耳朵清潔', price: 20, icon: '👂', description: '溫柔清潔耳朵' },
      { id: 'teeth_brushing', name: '刷牙', price: 10, icon: '🦷', description: '口腔護理' },
      { id: 'spa_treatment', name: 'SPA護膚', price: 30, icon: '🧴', description: '豪華護膚體驗' },
    ],
    special: [
      { id: 'energy_potion', name: '能量瓶', price: 40, icon: '💊', description: '恢復寵物活力' },
      { id: 'mystery_box', name: '神秘禮盒', price: 60, icon: '🎁', description: '隨機獲得道具' },
      { id: 'lucky_star', name: '幸運星', price: 80, icon: '🌟', description: '提升遊戲獎勵' },
    ],
  });

  const [currentEmotion, setCurrentEmotion] = useState('😊');
  const [currentMessage, setCurrentMessage] = useState('主人，我好想你！');

  const [showBackpack, setShowBackpack] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showMyPets, setShowMyPets] = useState(false);
  // 已拆分為 depositAmount / withdrawAmount
  const [savedMoney, setSavedMoney] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // 記帳相關狀態（MVP）
  const [showAccounting, setShowAccounting] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [amountInput, setAmountInput] = useState('');
  const [transactionType, setTransactionType] = useState('expense'); // 'expense' | 'income'
  const [transactionCategory, setTransactionCategory] = useState('餐飲');
  const [transactionNote, setTransactionNote] = useState('');
  const accountingCategories = [
    { id: '餐飲', icon: '🍱', desc: '餐廳、飲料、食材', color: '#FFB5BA', type: 'expense' },
    { id: '交通', icon: '🚌', desc: '公車、捷運、計程車', color: '#AEC6CF', type: 'expense' },
    { id: '日用品', icon: '🧺', desc: '生活用品、清潔、雜貨', color: '#B4CFB0', type: 'expense' },
    { id: '購物', icon: '🛍️', desc: '衣服、配件、電子產品', color: '#FF80AB', type: 'expense' },
    { id: '房貸', icon: '🏦', desc: '房貸、租金、管理費', color: '#64B5F6', type: 'expense' },
    { id: '娛樂', icon: '🎪', desc: '電影、遊戲、休閒', color: '#FFB347', type: 'expense' },
    { id: '醫療', icon: '🏥', desc: '門診、藥品、保健', color: '#98C1D9', type: 'expense' },
    { id: '寵物', icon: '🐰', desc: '飼料、玩具、美容', color: '#DDA0DD', type: 'expense' },
    { id: '學習', icon: '📚', desc: '課程、書籍、文具', color: '#4DB6AC', type: 'expense' },
    { id: '旅行', icon: '✈️', desc: '機票、住宿、行程', color: '#FFB74D', type: 'expense' },
    { id: '其他支出', icon: '📝', desc: '其他支出項目', color: '#F0E68C', type: 'expense' },
    { id: '工資', icon: '💰', desc: '月薪、時薪、加班費', color: '#90CAF9', type: 'income' },
    { id: '獎金', icon: '✨', desc: '年終、績效、各項獎金', color: '#FFD700', type: 'income' },
    { id: '投資', icon: '📈', desc: '股票、基金、定存利息', color: '#81C784', type: 'income' },
    { id: '中獎', icon: '🎰', desc: '彩券、抽獎、禮品', color: '#FF8A65', type: 'income' },
    { id: '副業', icon: '💼', desc: '兼職、接案、網拍', color: '#9575CD', type: 'income' },
    { id: '其他收入', icon: '💎', desc: '其他收入來源', color: '#78909C', type: 'income' },
  ];
  // 搜尋與篩選
  const [searchText, setSearchText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [swipedTransactionId, setSwipedTransactionId] = useState(null);
  const swipeAnimatedValues = useRef({}).current;
  const swipeableRefs = useRef({}).current;
  
  // 編輯相關狀態
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('expense');
  const [editCategory, setEditCategory] = useState('餐飲');
  const [editNote, setEditNote] = useState('');

  // 左滑刪除手勢
  const createPanResponder = (tx) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      resetSwipes(tx.id);
    },
    onPanResponderMove: (_, { dx }) => {
      if (dx < 0) {
        const x = Math.max(-80, dx);
        swipeAnimatedValues[tx.id].setValue(x / -80);
      }
    },
    onPanResponderRelease: (_, { dx, vx }) => {
      if (dx < -40 || vx < -0.5) {
        Animated.spring(swipeAnimatedValues[tx.id], {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        setSwipedTransactionId(tx.id);
      } else {
        Animated.spring(swipeAnimatedValues[tx.id], {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setSwipedTransactionId(null);
      }
    },
  });

  // 開始編輯交易
  const handleStartEdit = (tx) => {
    setEditingTransaction(tx);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditCategory(tx.category);
    setEditNote(tx.note || '');
    setShowEditModal(true);
  };

  // 儲存編輯
  const handleSaveEdit = () => {
    const amount = parseInt(editAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('金額無效', '請輸入大於 0 的金額');
      return;
    }

    setTransactions(prev => prev.map(tx => 
      tx.id === editingTransaction.id
        ? {
            ...tx,
            amount,
            type: editType,
            category: editCategory,
            note: editNote.trim(),
          }
        : tx
    ));

    setShowEditModal(false);
    setEditingTransaction(null);
    Alert.alert('編輯成功', '交易已更新');
  };

  // 刪除交易
  const handleDeleteTransaction = (id) => {
    Alert.alert(
      '確認刪除',
      '確定要刪除這筆交易嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => {
            setTransactions(prev => prev.filter(tx => tx.id !== id));
            setSwipedTransactionId(null);
          }
        }
      ]
    );
  };

  // 重置所有滑動狀態
  const resetSwipes = (exceptId) => {
    Object.entries(swipeableRefs).forEach(([id, ref]) => {
      if (id !== exceptId && ref?.close) {
        ref.close();
      }
    });
    if (!exceptId) {
      setSwipedTransactionId(null);
    }
  };

  // 計算月報表數據
  const getMonthlyStats = (month) => {
    const monthTransactions = transactions.filter(tx => tx.date.startsWith(month));
    const totalExpense = monthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = monthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const categoryStats = accountingCategories.map(cat => ({
      ...cat,
      amount: monthTransactions
        .filter(tx => tx.type === 'expense' && tx.category === cat.id)
        .reduce((sum, tx) => sum + tx.amount, 0)
    }));
    return { totalExpense, totalIncome, categoryStats };
  };

  // 篩選交易列表
  const filteredTransactions = transactions.filter(tx => {
    const matchSearch = searchText ? 
      (tx.note?.toLowerCase().includes(searchText.toLowerCase()) || 
       tx.category.toLowerCase().includes(searchText.toLowerCase())) : 
      true;
    const matchMonth = tx.date.startsWith(selectedMonth);
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(tx.category);
    return matchSearch && matchMonth && matchCategory;
  });
  // 記帳彈幕
  const [showAccountingDanmaku, setShowAccountingDanmaku] = useState(false);
  const [accountingDanmakuText, setAccountingDanmakuText] = useState('');
  const accountingDanmakuTimer = useRef(null);
  // 記帳頁面切換
  const [showAccountingPage, setShowAccountingPage] = useState(false);
  const [showSavingsPage, setShowSavingsPage] = useState(false);
  const [showGoalEditPage, setShowGoalEditPage] = useState(false);
  const [showDreamSavingsPage, setShowDreamSavingsPage] = useState(false);
  const [allocationMode, setAllocationMode] = useState('auto'); // 'auto' | 'manual'
  const [selectedAllocationGoal, setSelectedAllocationGoal] = useState('shortTerm'); // 'shortTerm' | 'mediumTerm' | 'longTerm'
  const [goalEdits, setGoalEdits] = useState({});
  const [dreamPlans, setDreamPlans] = useState([]);
  const [dreamForm, setDreamForm] = useState({ title: '', targetText: '', startDateText: '', endDateText: '' });
  const [selectedDreamPlanId, setSelectedDreamPlanId] = useState(null);
  const [selectedWithdrawDreamPlanId, setSelectedWithdrawDreamPlanId] = useState(null);
  const [dreamPlanInputs, setDreamPlanInputs] = useState({});
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editingPlanForm, setEditingPlanForm] = useState({ title: '', targetText: '', startDateText: '', endDateText: '' });

  const parseDateText = (text) => {
    if (!text || typeof text !== 'string') return null;
    const parts = text.split('/');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const d = parseInt(parts[2]);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const calculateDaysLeftFromText = (endDateText) => {
    const end = parseDateText(endDateText);
    if (!end) return null;
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const diff = Math.ceil((end.setHours(0,0,0,0) - now.setHours(0,0,0,0)) / oneDay);
    return diff;
  };

  const calculateSuggestedDaily = (current, target, endDateText) => {
    if (!target || target <= 0) return null;
    const daysLeft = calculateDaysLeftFromText(endDateText);
    if (daysLeft === null || daysLeft <= 0) return null;
    const remaining = Math.max(0, target - (current || 0));
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / daysLeft);
  };

  const handleSaveMoneyToPlan = (amount, planId) => {
    if (amount <= 0) {
      Alert.alert('❌ 存錢失敗', '請輸入大於 0 的金額！');
      return;
    }
    setSavedMoney(prev => prev + amount);
    setDreamPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const previousCurrent = p.current || 0;
      const nextCurrent = previousCurrent + amount;
      const reached = p.target && previousCurrent < p.target && nextCurrent >= p.target;
      if (reached) {
        Alert.alert('🎉 目標達成！', `恭喜完成「${p.title}」目標！`, [{ text: '太棒了！', style: 'default' }]);
      }
      return { ...p, current: nextCurrent };
    }));
    setDreamPlanInputs(prev => ({ ...prev, [planId]: '' }));
    Alert.alert('💰 存錢成功！', `已存入 ${amount} 元至「${(dreamPlans.find(p => p.id === planId) || {}).title || ''}」`, [{ text: '確定', style: 'default' }]);
  };
  
  // 存錢目標相關狀態
  const [savingsGoals, setSavingsGoals] = useState({
    shortTerm: {
      name: '短期目標',
      target: 1000,
      current: 0,
      days: 7,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    },
    mediumTerm: {
      name: '中期目標',
      target: 5000,
      current: 0,
      days: 30,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    },
    longTerm: {
      name: '長期目標',
      target: 20000,
      current: 0,
      days: 90,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    }
  });
  
  const [showSavingsGoals, setShowSavingsGoals] = useState(false);
  const [showFeedConfirm, setShowFeedConfirm] = useState(false);
  const [showPlayConfirm, setShowPlayConfirm] = useState(false);
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);

  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // 準備好的食物狀態
  const [preparedFood, setPreparedFood] = useState(null);
  
  // 準備好的玩具狀態
  const [preparedToy, setPreparedToy] = useState(null);
  
  // 準備好的美容服務狀態
  const [preparedGrooming, setPreparedGrooming] = useState(null);

  // 動畫值
  const tailWagAnimation = useRef(new Animated.Value(0)).current;
  const headTurnAnimation = useRef(new Animated.Value(0)).current;
  const heartAnimation = useRef(new Animated.Value(0)).current;
  const jumpAnimation = useRef(new Animated.Value(0)).current;
  const hungerAnimation = useRef(new Animated.Value(30)).current;
  const cleanlinessAnimation = useRef(new Animated.Value(30)).current;
  const affectionAnimation = useRef(new Animated.Value(30)).current;

  // 簡化圖片載入 - 立即載入
  useEffect(() => {
    // 啟動時載入持久化資料
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet([
          PERSIST_KEYS.transactions,
          PERSIST_KEYS.savedMoney,
          PERSIST_KEYS.dreamPlans,
          PERSIST_KEYS.selectedDreamPlanId,
          PERSIST_KEYS.selectedWithdrawDreamPlanId,
          PERSIST_KEYS.petStatus,
          PERSIST_KEYS.dailyCounters,
          PERSIST_KEYS.walkStreak,
          PERSIST_KEYS.backpack,
          PERSIST_KEYS.savingsGoals,
          PERSIST_KEYS.accountingSearchText,
          PERSIST_KEYS.accountingSelectedMonth,
          PERSIST_KEYS.accountingSelectedCategories,
          PERSIST_KEYS.showAccountingPage,
          PERSIST_KEYS.showSavingsPage,
          PERSIST_KEYS.showDreamSavingsPage,
          PERSIST_KEYS.showGoalEditPage,
        ]);
        const map = Object.fromEntries(entries);

        const storedTransactions = safeParseJson(map[PERSIST_KEYS.transactions], null);
        if (storedTransactions) setTransactions(storedTransactions);

        const storedSavedMoney = safeParseJson(map[PERSIST_KEYS.savedMoney], null);
        if (storedSavedMoney !== null) setSavedMoney(storedSavedMoney);

        const storedDreamPlans = safeParseJson(map[PERSIST_KEYS.dreamPlans], null);
        if (storedDreamPlans) setDreamPlans(storedDreamPlans);

        const storedSelectedDreamPlanId = safeParseJson(map[PERSIST_KEYS.selectedDreamPlanId], null);
        if (storedSelectedDreamPlanId) setSelectedDreamPlanId(storedSelectedDreamPlanId);

        const storedSelectedWithdrawDreamPlanId = safeParseJson(map[PERSIST_KEYS.selectedWithdrawDreamPlanId], null);
        if (storedSelectedWithdrawDreamPlanId) setSelectedWithdrawDreamPlanId(storedSelectedWithdrawDreamPlanId);

        const storedPetStatus = safeParseJson(map[PERSIST_KEYS.petStatus], null);
        if (storedPetStatus) setPetStatus(storedPetStatus);

        const storedDailyCounters = safeParseJson(map[PERSIST_KEYS.dailyCounters], null);
        if (storedDailyCounters) setDailyCounters(storedDailyCounters);

        const storedWalkStreak = safeParseJson(map[PERSIST_KEYS.walkStreak], null);
        if (storedWalkStreak) setWalkStreak(storedWalkStreak);

        const storedBackpack = safeParseJson(map[PERSIST_KEYS.backpack], null);
        if (storedBackpack) setBackpack(storedBackpack);

        const storedSavingsGoals = safeParseJson(map[PERSIST_KEYS.savingsGoals], null);
        if (storedSavingsGoals) setSavingsGoals(storedSavingsGoals);

        const storedSearchText = safeParseJson(map[PERSIST_KEYS.accountingSearchText], null);
        if (typeof storedSearchText === 'string') setSearchText(storedSearchText);

        const storedSelectedMonth = safeParseJson(map[PERSIST_KEYS.accountingSelectedMonth], null);
        if (typeof storedSelectedMonth === 'string') setSelectedMonth(storedSelectedMonth);

        const storedSelectedCategories = safeParseJson(map[PERSIST_KEYS.accountingSelectedCategories], null);
        if (Array.isArray(storedSelectedCategories)) setSelectedCategories(storedSelectedCategories);

        const storedShowAccounting = safeParseJson(map[PERSIST_KEYS.showAccountingPage], null);
        const storedShowSavings = safeParseJson(map[PERSIST_KEYS.showSavingsPage], null);
        const storedShowDream = safeParseJson(map[PERSIST_KEYS.showDreamSavingsPage], null);
        const storedShowGoalEdit = safeParseJson(map[PERSIST_KEYS.showGoalEditPage], null);
        if (typeof storedShowAccounting === 'boolean') setShowAccountingPage(storedShowAccounting);
        if (typeof storedShowSavings === 'boolean') setShowSavingsPage(storedShowSavings);
        if (typeof storedShowDream === 'boolean') setShowDreamSavingsPage(storedShowDream);
        if (typeof storedShowGoalEdit === 'boolean') setShowGoalEditPage(storedShowGoalEdit);
      } catch (e) {
        console.warn('AsyncStorage load error:', e);
      }
      hydratedRef.current = true;
    })();
  }, []);
  
  // 狀態變更時儲存（財務相關）
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.transactions, transactions); }, [transactions]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.savedMoney, savedMoney); }, [savedMoney]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.dreamPlans, dreamPlans); }, [dreamPlans]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.selectedDreamPlanId, selectedDreamPlanId); }, [selectedDreamPlanId]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.selectedWithdrawDreamPlanId, selectedWithdrawDreamPlanId); }, [selectedWithdrawDreamPlanId]);

  // 狀態變更時儲存（寵物與日常相關）
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.petStatus, petStatus); }, [petStatus]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.dailyCounters, dailyCounters); }, [dailyCounters]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.walkStreak, walkStreak); }, [walkStreak]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.backpack, backpack); }, [backpack]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.savingsGoals, savingsGoals); }, [savingsGoals]);

  // 記帳頁面 UI 狀態變更時儲存
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.accountingSearchText, searchText); }, [searchText]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.accountingSelectedMonth, selectedMonth); }, [selectedMonth]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.accountingSelectedCategories, selectedCategories); }, [selectedCategories]);

  // 頁面顯示狀態持久化
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.showAccountingPage, showAccountingPage); }, [showAccountingPage]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.showSavingsPage, showSavingsPage); }, [showSavingsPage]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.showDreamSavingsPage, showDreamSavingsPage); }, [showDreamSavingsPage]);
  useEffect(() => { if (hydratedRef.current) saveJson(PERSIST_KEYS.showGoalEditPage, showGoalEditPage); }, [showGoalEditPage]);

  // 簡化圖片載入 - 立即載入
  useEffect(() => {
    console.log('PetCareScreen 圖片載入完成');
    setImagesLoaded(true);
  }, []);

  // 檢查並重置每日計數器 - 每日00:00重置
  useEffect(() => {
    const checkAndResetCounters = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const lastReset = dailyCounters.lastResetDate;
      
      // 如果今天還沒重置過，就重置計數器
      if (lastReset !== today) {
        console.log('重置每日計數器 - 新的一天開始！');
        setDailyCounters({
          feedCount: 0,
          cleanCount: 0,
          petCount: 0,
          walkCount: 0,
          perfectStatusRewardClaimed: false, // 重置完美狀態獎勵
          petInteractionCount: 0, // 重置摸摸頭次數
          petInteractionCoins: 0, // 重置摸摸頭冰冰幣
          petInteractionAffection: 0, // 重置摸摸頭親密度
          lastResetDate: today,
        });
        
        // 重置寵物語錄觸發狀態
        if (setPetQuoteTriggered) {
          setPetQuoteTriggered(false);
          console.log('重置寵物語錄觸發狀態');
        }
      }
    };

    // 立即檢查一次
    checkAndResetCounters();

    // 設定定時器，每分鐘檢查一次是否需要重置
    const interval = setInterval(checkAndResetCounters, 60000);

    return () => clearInterval(interval);
  }, [dailyCounters.lastResetDate]);

  // 存錢處理函數
  const handleSaveMoney = (amount) => {
    if (amount <= 0) {
      Alert.alert('❌ 存錢失敗', '請輸入大於 0 的金額！');
      return;
    }
    if (!selectedDreamPlanId) {
      Alert.alert('❌ 存錢失敗', '請先選擇一個夢想計畫');
      return;
    }
    
    setSavedMoney(prev => prev + amount);
    
    // 若有選擇夢想計畫，將金額加到該計畫 current
    const selectedPlan = dreamPlans.find(p => p.id === selectedDreamPlanId);
    if (selectedPlan) {
      const previousCurrent = selectedPlan.current || 0;
      const nextCurrent = previousCurrent + amount;
      const reached = selectedPlan.target && previousCurrent < selectedPlan.target && nextCurrent >= selectedPlan.target;
      setDreamPlans(prev => prev.map(p => p.id === selectedDreamPlanId ? { ...p, current: nextCurrent } : p));
      if (reached) {
        Alert.alert('🎉 目標達成！', `恭喜完成「${selectedPlan.title}」目標！`, [{ text: '太棒了！', style: 'default' }]);
      }
    }
    
    setDepositAmount('');
    Alert.alert('💰 存錢成功！', `成功存入 ${amount} 元！\n繼續努力存錢吧！`, [{ text: '確定', style: 'default' }]);
  };

  // 取出存錢筒中的錢
  const handleWithdrawMoney = (amount) => {
    if (amount <= 0 || amount > savedMoney) {
      Alert.alert('❌ 取出失敗', '金額無效或儲蓄餘額不足！');
      return;
    }
    if (!selectedWithdrawDreamPlanId) {
      Alert.alert('❌ 取出失敗', '請先選擇一個夢想計畫');
      return;
    }
    const plan = dreamPlans.find(p => p.id === selectedWithdrawDreamPlanId);
    const current = plan ? (plan.current || 0) : 0;
    if (!plan || amount > current) {
      Alert.alert('❌ 取出失敗', '選定計畫的可取出金額不足！');
      return;
    }
    
    setSavedMoney(prev => prev - amount);
    setDreamPlans(prev => prev.map(p => p.id === selectedWithdrawDreamPlanId ? { ...p, current: (p.current || 0) - amount } : p));
    setWithdrawAmount('');
    
    Alert.alert(
      '💰 取出成功！',
      `已自「${plan.title}」取出 ${amount} 元！`,
      [{ text: '確定', style: 'default' }]
    );
  };

  // 手動領取存錢目標獎勵
  const claimSavingsReward = (goalType) => {
    const goal = savingsGoals[goalType];
    
    if (!goal.completed) {
      Alert.alert('❌ 領取失敗', '目標尚未完成，無法領取獎勵！');
      return;
    }
    
    if (goal.rewardClaimed) {
      Alert.alert('❌ 領取失敗', '獎勵已經領取過了！');
      return;
    }
    
    // 給予獎勵
    setBackpack(prev => ({
      ...prev,
      iceCoins: prev.iceCoins + goal.reward
    }));
    
    // 標記獎勵已領取
    setSavingsGoals(prev => ({
      ...prev,
      [goalType]: {
        ...prev[goalType],
        rewardClaimed: true
      }
    }));
    
    Alert.alert(
      '🎉 獎勵領取成功！',
      `恭喜獲得 ${goal.reward} 冰冰幣獎勵！`,
      [{ text: '太棒了！', style: 'default' }]
    );
  };

  // 設定存錢目標函數
  const setSavingsGoal = (goalType, target, days) => {
    setSavingsGoals(prev => {
      const parsedTarget = parseInt(target);
      const parsedDays = parseInt(days);
      const next = { ...prev };
      const goal = next[goalType];
      const nextDeadline = new Date(Date.now() + parsedDays * 24 * 60 * 60 * 1000).toISOString();
      goal.target = parsedTarget;
      goal.days = parsedDays;
      goal.deadline = nextDeadline;
      // 不重置 current，僅依據新 target 更新 completed 狀態
      goal.completed = goal.current >= goal.target;
      return next;
    });
  };
  
  // 計算目標完成百分比
  const calculateGoalProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };
  
  // 計算剩餘天數
  const calculateDaysLeft = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  // 獎勵計算函數
  const calculateCoins = (actionType, currentCount) => {
    let baseReward = 0;
    let bonusReward = 0;
    let bonusMessage = '';

    switch (actionType) {
      case 'feed':
        // 餵食：每次3冰冰幣，最多5次 = 15冰冰幣
        if (currentCount + 1 <= 5) {
          baseReward = 3;
          if (currentCount + 1 === 5) {
            bonusMessage = '餵食達成每日目標！';
          }
        } else {
          baseReward = 0;
          bonusMessage = '今日餵食已達上限！';
        }
        break;
      case 'clean':
        // 清潔：每次5冰冰幣，最多3次 = 15冰冰幣
        if (currentCount + 1 <= 3) {
          baseReward = 5;
          if (currentCount + 1 === 3) {
            bonusMessage = '清潔達成每日目標！';
          }
        } else {
          baseReward = 0;
          bonusMessage = '今日清潔已達上限！';
        }
        break;
      case 'pet':
        // 撫摸：每次2冰冰幣，最多10次 = 20冰冰幣
        if (currentCount + 1 <= 10) {
          baseReward = 2;
          if (currentCount + 1 === 10) {
            bonusMessage = '撫摸達成每日目標！';
          }
        } else {
          baseReward = 0;
          bonusMessage = '今日撫摸已達上限！';
        }
        break;
      case 'walk':
        // 散步：每次10冰冰幣，最多5次 = 50冰冰幣
        if (currentCount + 1 <= 5) {
          baseReward = 10;
          if (currentCount + 1 === 5) {
            bonusMessage = '散步達成每日目標！';
          }
        } else {
          baseReward = 0;
          bonusMessage = '今日散步已達上限！';
        }
        break;
      default:
        baseReward = 0;
    }

    return { baseReward, bonusReward, bonusMessage };
  };

  // 檢查完美狀態並發放特殊道具獎勵
  const checkPerfectStatusReward = () => {
    // 檢查是否所有狀態都達到100%且今日尚未領取獎勵
    if (petStatus.hunger === 100 && 
        petStatus.cleanliness === 100 && 
        petStatus.affection === 100 && 
        !dailyCounters.perfectStatusRewardClaimed) {
      
      // 隨機選擇一個特殊道具
      const specialItems = shopItems.special;
      const randomItem = specialItems[Math.floor(Math.random() * specialItems.length)];
      
      // 更新背包，添加獲得的特殊道具
      setBackpack(prev => ({
        ...prev,
        special: {
          ...prev.special,
          [randomItem.id]: {
            ...prev.special[randomItem.id],
            quantity: prev.special[randomItem.id].quantity + 1
          }
        }
      }));
      
      // 標記今日已領取獎勵
      setDailyCounters(prev => ({
        ...prev,
        perfectStatusRewardClaimed: true
      }));
      
      // 設置特殊情緒和訊息
      setCurrentEmotion('🌟');
      setCurrentMessage(`🎉 完美狀態達成！獲得特殊獎勵：${randomItem.name}！`);
      
      // 顯示獎勵彈窗
      Alert.alert(
        '🌟 完美狀態獎勵！',
        `恭喜！你的寵物達到了完美狀態！\n獲得特殊道具：${randomItem.name}\n\n明天再次達到完美狀態可以獲得新的獎勵！`,
        [{ text: '太棒了！', style: 'default' }]
      );
    }
  };

  // 監聽寵物狀態變化，檢查是否達到完美狀態
  useEffect(() => {
    checkPerfectStatusReward();
  }, [petStatus.hunger, petStatus.cleanliness, petStatus.affection, dailyCounters.perfectStatusRewardClaimed]);

  // 每日獎勵整合
  useEffect(() => {
    if (dailyRewardClaimed) {
      setBackpack(prev => ({
        ...prev,
        iceCoins: prev.iceCoins + 20
      }));
      onDailyRewardClaimed();
    }
  }, [dailyRewardClaimed]);

  // 準備食物（從背包中取出）
  const prepareFoodItem = (foodId) => {
    const foodItem = backpack.food[foodId];
    if (foodItem && foodItem.quantity > 0) {
      // 如果已經有準備好的食物，先歸還到背包
      if (preparedFood) {
        setBackpack(prev => ({
          ...prev,
          food: {
            ...prev.food,
            [preparedFood.id]: {
              ...prev.food[preparedFood.id],
              quantity: prev.food[preparedFood.id].quantity + 1
            }
          }
        }));
      }

      let hungerIncrease = 0;
      let itemName = '';
      
      // 根據不同食物類型設定飽食度增加量
      switch (foodId) {
        case 'nutrition_meat':
          hungerIncrease = 5; // +5%
          itemName = '營養肉乾';
          break;
        case 'delicious_cookie':
          hungerIncrease = 10; // +10%
          itemName = '美味餅乾';
          break;
        case 'healthy_fruit':
          hungerIncrease = 15; // +15%
          itemName = '健康水果';
          break;
        default:
          hungerIncrease = 5;
          itemName = foodItem.name;
      }
      
      // 設定準備好的食物
      setPreparedFood({
        id: foodId,
        name: itemName,
        hungerIncrease: hungerIncrease
      });

      // 更新背包（減少道具數量）
      setBackpack(prev => ({
        ...prev,
        food: {
          ...prev.food,
          [foodId]: {
            ...prev.food[foodId],
            quantity: prev.food[foodId].quantity - 1
          }
        }
      }));

      setCurrentEmotion('😊');
      setCurrentMessage(`準備了${itemName}！現在可以點擊餵食按鈕來餵我了～`);
      
      // 關閉背包
      setShowBackpack(false);
    } else {
      setCurrentMessage('沒有這個道具了...');
    }
  };

  // 準備玩具（從背包中取出）
  const prepareToyItem = (toyId) => {
    const toyItem = backpack.toys[toyId];
    if (toyItem && toyItem.quantity > 0) {
      // 如果已經有準備好的玩具，先歸還到背包
      if (preparedToy) {
        setBackpack(prev => ({
          ...prev,
          toys: {
            ...prev.toys,
            [preparedToy.id]: {
              ...prev.toys[preparedToy.id],
              quantity: prev.toys[preparedToy.id].quantity + 1
            }
          }
        }));
      }

      let affectionIncrease = 0;
      let itemName = '';
      
      // 根據不同玩具類型設定親密度增加量
      switch (toyId) {
        case 'plush_toy':
          affectionIncrease = 5; // +5%
          itemName = '絨毛玩偶';
          break;
        case 'bouncy_ball':
          affectionIncrease = 8; // +8%
          itemName = '彈跳球';
          break;
        case 'chew_bone':
          affectionIncrease = 10; // +10%
          itemName = '磨牙骨';
          break;
        case 'feather_wand':
          affectionIncrease = 12; // +12%
          itemName = '逗貓棒';
          break;
        default:
          affectionIncrease = 5;
          itemName = toyItem.name;
      }
      
      // 設定準備好的玩具
      setPreparedToy({
        id: toyId,
        name: itemName,
        affectionIncrease: affectionIncrease
      });

      // 更新背包（減少道具數量）
      setBackpack(prev => ({
        ...prev,
        toys: {
          ...prev.toys,
          [toyId]: {
            ...prev.toys[toyId],
            quantity: prev.toys[toyId].quantity - 1
          }
        }
      }));

      setCurrentEmotion('😊');
      setCurrentMessage(`準備了${itemName}！現在可以點擊玩耍按鈕來一起玩了～`);
      
      // 關閉背包
      setShowBackpack(false);
    } else {
      setCurrentMessage('沒有這個玩具了...');
    }
  };

  // 準備美容服務（從背包中取出）
  const prepareGroomingItem = (groomingId) => {
    const groomingItem = backpack.grooming[groomingId];
    if (groomingItem && groomingItem.quantity > 0) {
      // 如果已經有準備好的美容服務，先歸還到背包
      if (preparedGrooming) {
        setBackpack(prev => ({
          ...prev,
          grooming: {
            ...prev.grooming,
            [preparedGrooming.id]: {
              ...prev.grooming[preparedGrooming.id],
              quantity: prev.grooming[preparedGrooming.id].quantity + 1
            }
          }
        }));
      }

      let cleanlinessIncrease = 0;
      let itemName = '';
      
      // 根據不同美容服務類型設定清潔度增加量
      switch (groomingId) {
        case 'bath_service':
          cleanlinessIncrease = 10;
          itemName = '洗澡';
          break;
        case 'ear_cleaning':
          cleanlinessIncrease = 20;
          itemName = '耳朵清潔';
          break;
        case 'teeth_brushing':
          cleanlinessIncrease = 5;
          itemName = '刷牙';
          break;
        case 'spa_treatment':
          cleanlinessIncrease = 35;
          itemName = 'SPA護膚';
          break;
        default:
          cleanlinessIncrease = 10;
          itemName = groomingItem.name;
      }
      
      // 設定準備好的美容服務
      setPreparedGrooming({
        id: groomingId,
        name: itemName,
        cleanlinessIncrease: cleanlinessIncrease
      });

      // 更新背包（減少道具數量）
      setBackpack(prev => ({
        ...prev,
        grooming: {
          ...prev.grooming,
          [groomingId]: {
            ...prev.grooming[groomingId],
            quantity: prev.grooming[groomingId].quantity - 1
          }
        }
      }));

      setCurrentEmotion('😊');
      setCurrentMessage(`準備了${itemName}服務！現在可以點擊清潔按鈕來享受服務了～`);
      
      // 關閉背包
      setShowBackpack(false);
    } else {
      setCurrentMessage('沒有這個美容服務了...');
    }
  };

  // 餵食確認功能
  const confirmFeed = () => {
    if (preparedFood) {
      // 有準備好的食物，進行餵食
      const newHunger = Math.min(100, petStatus.hunger + preparedFood.hungerIncrease);
      const newAffection = Math.min(100, petStatus.affection + 3);
      
      // 計算獎勵
      const { baseReward, bonusReward, bonusMessage } = calculateCoins('feed', dailyCounters.feedCount);
      const totalCoins = baseReward;
      
      // 更新寵物狀態
      setPetStatus(prev => ({
        ...prev,
        hunger: newHunger,
        affection: newAffection,
      }));

      // 更新冰冰幣
      setBackpack(prev => ({
        ...prev,
        iceCoins: prev.iceCoins + totalCoins
      }));

      // 更新計數器
      setDailyCounters(prev => ({
        ...prev,
        feedCount: prev.feedCount + 1
      }));

      setCurrentEmotion('😋');
      let message = `使用了${preparedFood.name}！飽食度+${preparedFood.hungerIncrease}%！獲得 ${totalCoins} 冰冰幣！`;
      if (bonusMessage) {
        message += `\n${bonusMessage}`;
      }
      setCurrentMessage(message);
      
      setTodayStats(prev => ({
        ...prev,
        feedCount: prev.feedCount + 1,
        affectionGained: prev.affectionGained + 3
      }));

      // 清除準備好的食物
      setPreparedFood(null);
    }
    
    // 關閉確認框
    setShowFeedConfirm(false);
  };

  // 基本互動函數
  const onPressFeed = () => {
    if (preparedFood) {
      // 有準備好的食物，顯示確認框
      setShowFeedConfirm(true);
    } else {
      // 沒有準備好的食物
      setCurrentEmotion('😋');
      setCurrentMessage('想要餵我嗎？請先到背包中選擇食物道具準備喔！');
    }
  };

  // 清潔確認功能
  const confirmClean = () => {
    if (preparedGrooming) {
      // 有準備好的美容服務，進行清潔
      const newCleanliness = Math.min(100, petStatus.cleanliness + preparedGrooming.cleanlinessIncrease);
      
      // 計算獎勵
      const { baseReward, bonusReward, bonusMessage } = calculateCoins('clean', dailyCounters.cleanCount);
      const totalCoins = baseReward;
      
      // 更新寵物狀態
      setPetStatus(prev => ({
        ...prev,
        cleanliness: newCleanliness,
      }));

      // 更新冰冰幣
      setBackpack(prev => ({
        ...prev,
        iceCoins: prev.iceCoins + totalCoins
      }));

      // 更新計數器
      setDailyCounters(prev => ({
        ...prev,
        cleanCount: prev.cleanCount + 1
      }));

      setCurrentEmotion('😌');
      let message = `享受了${preparedGrooming.name}服務！清潔度+${preparedGrooming.cleanlinessIncrease}%！獲得 ${totalCoins} 冰冰幣！`;
      if (bonusMessage) {
        message += `\n${bonusMessage}`;
      }
      setCurrentMessage(message);
      
      setTodayStats(prev => ({
        ...prev,
        cleanCount: prev.cleanCount + 1
      }));

      // 清除準備好的美容服務
      setPreparedGrooming(null);
    }
    
    // 關閉確認框
    setShowCleanConfirm(false);
  };

  const onPressClean = () => {
    if (preparedGrooming) {
      // 有準備好的美容服務，顯示確認框
      setShowCleanConfirm(true);
    } else {
      // 沒有準備好的美容服務
      setCurrentEmotion('😊');
      setCurrentMessage('想要清潔嗎？請先到背包中選擇美容服務準備喔！');
    }
  };

  const onPressPet = () => {
    // 檢查每日上限
    const maxDailyInteractions = 30;
    const maxDailyCoins = 30;
    const maxDailyAffection = 30;
    
    if (dailyCounters.petInteractionCount >= maxDailyInteractions) {
      setCurrentEmotion('😴');
      setCurrentMessage('今日摸摸頭獎勵次數已滿！');
      return;
    }
    
    // 每次固定增加1%親密度和1冰冰幣
    const affectionIncrease = 1;
    const coinsGained = 1;
    
    const newAffection = Math.min(100, petStatus.affection + affectionIncrease);
    
    setPetStatus(prev => ({
      ...prev,
      affection: newAffection,
    }));

    setBackpack(prev => ({
      ...prev,
      iceCoins: prev.iceCoins + coinsGained
    }));

    // 更新摸摸頭專用計數器
    setDailyCounters(prev => ({
      ...prev,
      petCount: prev.petCount + 1,
      petInteractionCount: prev.petInteractionCount + 1,
      petInteractionCoins: prev.petInteractionCoins + coinsGained,
      petInteractionAffection: prev.petInteractionAffection + affectionIncrease
    }));

    setCurrentEmotion('😊');
    const currentCount = dailyCounters.petInteractionCount + 1;
    const remainingInteractions = maxDailyInteractions - currentCount;
    
    let message = '';
    
    // 根據次數顯示不同訊息
    if (currentCount === 1) {
      message = `好舒服～親密度+${affectionIncrease}%，獲得 ${coinsGained} 冰冰幣🎉`;
    } else if (currentCount === 20) {
      message = `好開心～親密度+${affectionIncrease}%，獲得 ${coinsGained} 冰冰幣🎉，獎勵還剩10次喔`;
    } else if (currentCount === 30) {
      message = `最喜歡主人摸我～親密度+${affectionIncrease}%，獲得 ${coinsGained} 冰冰幣🎉`;
    } else {
      // 其他次數的一般訊息
      message = `好舒服～親密度+${affectionIncrease}%，獲得 ${coinsGained} 冰冰幣🎉`;
      if (remainingInteractions > 0) {
        message += `，還剩${remainingInteractions}次`;
      }
    }
    
    setCurrentMessage(message);
    
    setTodayStats(prev => ({
      ...prev,
      petCount: prev.petCount + 1,
      affectionGained: prev.affectionGained + affectionIncrease
    }));
  };

  // 玩耍確認功能
  const confirmPlay = () => {
    if (preparedToy) {
      // 有準備好的玩具，進行玩耍
      const newAffection = Math.min(100, petStatus.affection + preparedToy.affectionIncrease);
      
      // 計算獎勵
      const { baseReward, bonusReward, bonusMessage } = calculateCoins('walk', dailyCounters.walkCount);
      const totalCoins = baseReward;
      
      // 更新寵物狀態
      setPetStatus(prev => ({
        ...prev,
        affection: newAffection,
      }));

      // 更新冰冰幣
      setBackpack(prev => ({
        ...prev,
        iceCoins: prev.iceCoins + totalCoins
      }));

      // 更新計數器
      setDailyCounters(prev => ({
        ...prev,
        walkCount: prev.walkCount + 1
      }));

      setCurrentEmotion('😄');
      let message = `用${preparedToy.name}玩耍好開心~親密度+${preparedToy.affectionIncrease}%！獲得 ${totalCoins} 冰冰幣！`;
      if (bonusMessage) {
        message += `\n${bonusMessage}`;
      }
      setCurrentMessage(message);
      
      setTodayStats(prev => ({
        ...prev,
        walkCount: prev.walkCount + 1,
        affectionGained: prev.affectionGained + preparedToy.affectionIncrease
      }));

      // 清除準備好的玩具
      setPreparedToy(null);
    }
    
    // 關閉確認框
    setShowPlayConfirm(false);
  };

  const onPressWalk = () => {
    if (preparedToy) {
      // 有準備好的玩具，顯示確認框
      setShowPlayConfirm(true);
    } else {
      // 沒有準備好的玩具
      setCurrentEmotion('😊');
      setCurrentMessage('想要和我玩耍嗎？請先到背包中選擇玩具道具準備喔！');
    }
  };

  // 購買功能
  const handlePurchase = (item) => {
    if (backpack.iceCoins >= item.price) {
      // 一次性更新背包（扣除冰冰幣並增加商品數量）
      setBackpack(prev => {
        const newBackpack = {
          ...prev,
          iceCoins: prev.iceCoins - item.price
        };

        // 根據商品類型增加數量
        if (item.category === 'food' && newBackpack.food[item.id]) {
          newBackpack.food = {
            ...prev.food,
            [item.id]: {
              ...prev.food[item.id],
              quantity: prev.food[item.id].quantity + 1
            }
          };
        } else if (item.category === 'toys' && newBackpack.toys[item.id]) {
          newBackpack.toys = {
            ...prev.toys,
            [item.id]: {
              ...prev.toys[item.id],
              quantity: prev.toys[item.id].quantity + 1
            }
          };
        } else if (item.category === 'grooming' && newBackpack.grooming[item.id]) {
          newBackpack.grooming = {
            ...prev.grooming,
            [item.id]: {
              ...prev.grooming[item.id],
              quantity: prev.grooming[item.id].quantity + 1
            }
          };
        } else if (item.category === 'special' && newBackpack.special[item.id]) {
          newBackpack.special = {
            ...prev.special,
            [item.id]: {
              ...prev.special[item.id],
              quantity: prev.special[item.id].quantity + 1
            }
          };
        }

        return newBackpack;
      });

      // 設置情緒和訊息
      if (item.category === 'food') {
        setCurrentEmotion('😋');
        setCurrentMessage(`買到了${item.name}！寵物會很開心的～`);
      } else if (item.category === 'toys') {
        setCurrentEmotion('🎾');
        setCurrentMessage(`買到了${item.name}！新玩具到手～`);
      } else if (item.category === 'grooming') {
        setCurrentEmotion('✨');
        setCurrentMessage(`買到了${item.name}！美容服務到手～`);
      } else if (item.category === 'special') {
        setCurrentEmotion('✨');
        setCurrentMessage(`買到了${item.name}！特殊道具到手～`);
      }

      Alert.alert('購買成功', `已購買 ${item.name}！商品已存入背包。`);
    } else {
      Alert.alert('冰冰幣不足', '您的冰冰幣不夠購買此商品，請先賺取更多冰冰幣！');
    }
  };

  // 新增交易（記帳）
  const handleAddTransaction = () => {
    const amount = parseInt(amountInput, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('金額無效', '請輸入大於 0 的金額');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount,
      type: transactionType,
      category: transactionCategory,
      note: transactionNote,
      date: new Date().toISOString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // 記帳→寵物加成與冰冰幣回饋
    const hungerDelta = transactionType === 'expense' ? 2 : 0;
    const cleanlinessDelta = transactionType === 'income' ? 2 : 0;
    const affectionDelta = 1;

    setPetStatus(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + hungerDelta),
      cleanliness: Math.min(100, prev.cleanliness + cleanlinessDelta),
      affection: Math.min(100, prev.affection + affectionDelta),
    }));

    setBackpack(prev => ({
      ...prev,
      iceCoins: prev.iceCoins + 2,
    }));

    setTodayStats(prev => ({
      ...prev,
      affectionGained: prev.affectionGained + affectionDelta,
    }));

    // 重置輸入欄位
    setAmountInput('');
    setTransactionNote('');



    // 顯示大字彈幕
    try { if (accountingDanmakuTimer.current) { clearTimeout(accountingDanmakuTimer.current); } } catch (e) {}
    setAccountingDanmakuText(`${transactionType === 'expense' ? '支出' : '收入'} $${amount} ｜ +2 🧊`);
    setShowAccountingDanmaku(true);
    accountingDanmakuTimer.current = setTimeout(() => {
      setShowAccountingDanmaku(false);
    }, 2000);
  };

  const themeColors = isDarkTheme
    ? {
        background: '#121212',
        card: '#1E1E1E',
        text: '#EDEFF2',
        subText: '#B0BEC5',
        accent: '#90CAF9',
      }
    : {
        background: '#FFFFFF',
        card: '#FFFFFF',
        text: '#333333',
        subText: '#666666',
        accent: '#1976D2',
  };

  const i18nLocal = {
    'zh-TW': {
      feed: '餵食', clean: '清潔', pet: '摸摸頭', play: '玩耍',
      accounting: '記帳', backpack: '背包', shop: '商店', savings: '存錢',
      accountingPage: '記帳', inputAmount: '輸入金額', type: '類型', category: '類別', note: '備註', monthlyReport: '月報表', transactionList: '交易列表', amount: '金額',
      savingsPage: '存錢', savingsFeature: '存錢功能', depositSection: '存入功能', depositAmount: '存入金額：', withdrawSection: '取出功能', withdrawAmount: '取出金額：', goalsProgress: '目標進度', dreamSavings: '夢想存錢', depositAction: '存入', withdrawAction: '取出'
    },
    en: {
      feed: 'Feed', clean: 'Clean', pet: 'Head Pat', play: 'Play',
      accounting: 'Accounting', backpack: 'Backpack', shop: 'Shop', savings: 'Save',
      accountingPage: 'Accounting', inputAmount: 'Amount', type: 'Type', category: 'Category', note: 'Note', monthlyReport: 'Monthly Report', transactionList: 'Transactions', amount: 'Amount',
      savingsPage: 'Savings', savingsFeature: 'Savings Feature', depositSection: 'Deposit', depositAmount: 'Deposit Amount:', withdrawSection: 'Withdraw', withdrawAmount: 'Withdraw Amount:', goalsProgress: 'Goals Progress', dreamSavings: 'Dream Savings', depositAction: 'Deposit', withdrawAction: 'Withdraw'
    }
  };
  const tt = (key) => (i18nLocal[(typeof language === 'string' ? language : 'zh-TW')] && i18nLocal[(typeof language === 'string' ? language : 'zh-TW')][key]) || (i18nLocal['zh-TW'][key] || key);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* 標題欄 */}
      <View style={[styles.header, { backgroundColor: isDarkTheme ? '#0B1220' : '#F8FBFF', borderBottomColor: isDarkTheme ? '#263238' : '#E3F2FD' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkTheme ? '#90CAF9' : '#1976D2'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>{selectedPet.name}的專屬空間</Text>
        <View style={styles.headerRight}>
          <Text style={styles.emotion}>{currentEmotion}</Text>
          <View style={styles.iceCoinContainer}>
            <Image 
              source={require('./B/M.png')} 
              style={styles.iceCoinIcon}
              onError={(error) => console.log('冰晶藍幣圖片載入失敗:', error)}
              onLoad={() => console.log('冰晶藍幣圖片載入成功')}
            />
            <Text style={[styles.iceCoinText, { color: themeColors.text }]}>{backpack.iceCoins}</Text>
          </View>
        </View>
      </View>

      {showAccountingDanmaku && (
        <View style={styles.accountingDanmaku} pointerEvents="none">
          <Text style={styles.accountingDanmakuText}>{accountingDanmakuText}</Text>
        </View>
      )}

      {/* 寵物顯示區域 */}
      <View style={styles.petDisplayArea}>
        <View style={styles.roomBackground}>
          <TouchableOpacity style={styles.petContainer}>
            <Image 
              source={selectedPet.image} 
              style={styles.petImage}
              resizeMode="contain"
              fadeDuration={200}
            />
            
            {/* 對話泡泡 */}
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{currentMessage}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 狀態條 */}
      <View style={styles.statusBars}>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>🍖</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.hungerBar, { width: `${petStatus.hunger}%` }]} />
          </View>
          <Text style={[
            styles.statusValue,
            isDarkTheme ? styles.statusValueDark : styles.statusValueLight
          ]}>{petStatus.hunger}%</Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>🧼</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.cleanlinessBar, { width: `${petStatus.cleanliness}%` }]} />
          </View>
          <Text style={[
            styles.statusValue,
            isDarkTheme ? styles.statusValueDark : styles.statusValueLight
          ]}>{petStatus.cleanliness}%</Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>💗</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.affectionBar, { width: `${petStatus.affection}%` }]} />
          </View>
          <Text style={[
            styles.statusValue,
            isDarkTheme ? styles.statusValueDark : styles.statusValueLight
          ]}>{petStatus.affection}%</Text>
        </View>
      </View>

      {/* 完美狀態指示器 */}
      <View style={styles.perfectStatusIndicator}>
        <Text style={[
          styles.perfectStatusIcon,
          petStatus.hunger === 100 && petStatus.cleanliness === 100 && petStatus.affection === 100 
            ? styles.perfectStatusIconActive 
            : styles.perfectStatusIconInactive
        ]}>
          ⭐
        </Text>
        <Text style={styles.perfectStatusText}>
          {petStatus.hunger === 100 && petStatus.cleanliness === 100 && petStatus.affection === 100 
            ? (dailyCounters.perfectStatusRewardClaimed ? '今日已領取特殊獎勵' : '完美狀態！可獲得特殊獎勵') 
            : '達到完美狀態可獲得特殊道具'}
        </Text>
      </View>

      {/* 互動按鈕 */}
      <View style={[styles.interactionButtons, isDarkTheme && { backgroundColor: '#0B1220' }]}>
        <View style={styles.feedButtonContainer}>
          <TouchableOpacity style={[styles.interactionButton, isDarkTheme && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1, shadowColor: '#000' }, preparedFood && styles.interactionButtonReady]} onPress={onPressFeed}>
            <Text style={styles.buttonIcon}>🍖</Text>
            <Text style={[styles.buttonText, { color: themeColors.text }]}>{tt('feed')}</Text>
          </TouchableOpacity>
          {preparedFood && (
            <Text style={styles.preparedFoodText}>已準備：{preparedFood.name}</Text>
          )}
        </View>

        <View style={styles.cleanButtonContainer}>
          <TouchableOpacity style={[styles.interactionButton, isDarkTheme && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1, shadowColor: '#000' }, preparedGrooming && styles.interactionButtonReady]} onPress={onPressClean}>
            <Text style={styles.buttonIcon}>🛁</Text>
            <Text style={[styles.buttonText, { color: themeColors.text }]}>{tt('clean')}</Text>
          </TouchableOpacity>
          {preparedGrooming && (
            <Text style={styles.preparedGroomingText}>已準備：{preparedGrooming.name}</Text>
          )}
        </View>

        <TouchableOpacity style={[styles.interactionButton, isDarkTheme && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1, shadowColor: '#000' }]} onPress={onPressPet}>
          <Text style={styles.buttonIcon}>✋</Text>
          <Text style={[styles.buttonText, { color: themeColors.text }]}>{tt('pet')}</Text>
        </TouchableOpacity>

        <View style={styles.playButtonContainer}>
          <TouchableOpacity style={[styles.interactionButton, isDarkTheme && { backgroundColor: '#1E293B', borderColor: '#334155', borderWidth: 1, shadowColor: '#000' }, preparedToy && styles.interactionButtonReady]} onPress={onPressWalk}>
            <Text style={styles.buttonIcon}>⚽</Text>
            <Text style={[styles.buttonText, { color: themeColors.text }]}>{tt('play')}</Text>
          </TouchableOpacity>
          {preparedToy && (
            <Text style={styles.preparedToyText}>已準備：{preparedToy.name}</Text>
          )}
        </View>
      </View>

      {/* 新功能按鈕 */}
      <View style={styles.newFunctionRow}>


        <TouchableOpacity style={[styles.accountingButton, isDarkTheme && { backgroundColor: '#1E293B', borderColor: '#334155', shadowColor: '#000' }]} onPress={() => setShowAccountingPage(true)}>
          <Text style={styles.accountingButtonIcon}>🧾</Text>
          <Text style={[styles.accountingButtonText, isDarkTheme && { color: themeColors.text }]}>{tt('accounting')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.backpackButton, isDarkTheme && { backgroundColor: '#1E293B', borderColor: '#334155', shadowColor: '#000' }]} onPress={() => setShowBackpack(true)}>
          <Text style={styles.backpackButtonIcon}>📦</Text>
          <Text style={[styles.backpackButtonText, isDarkTheme && { color: themeColors.text }]}>{tt('backpack')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.shopButton, isDarkTheme && { backgroundColor: '#1E293B', borderColor: '#334155', shadowColor: '#000' }]} onPress={() => setShowShop(true)}>
          <Text style={styles.shopButtonIcon}>🛍️</Text>
          <Text style={[styles.shopButtonText, isDarkTheme && { color: themeColors.text }]}>{tt('shop')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.savingsButton, isDarkTheme && { backgroundColor: '#3E2A11', borderColor: '#FFB74D', shadowColor: '#000' }]} onPress={() => setShowSavingsPage(true)}>
          <Text style={styles.savingsButtonIcon}>💰</Text>
          <Text style={[styles.savingsButtonText, isDarkTheme && { color: themeColors.text }]}>{tt('savings')}</Text>
        </TouchableOpacity>
      </View>

      {/* 功能模態框 */}

      {/* 毛小孩們 */}
      <Modal
        visible={showMyPets}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMyPets(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.backpackModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🐾 毛小孩們</Text>
              <TouchableOpacity onPress={() => setShowMyPets(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={[styles.modalContent, { padding: 20 }]}>
              <View style={{ alignItems: 'center' }}>
                <Image source={selectedPet.image} style={{ width: 160, height: 160, borderRadius: 20 }} />
                <Text style={[styles.sectionTitle, { marginTop: 10 }]}>{selectedPet.name}</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBackpack}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBackpack(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.backpackModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📦 背包</Text>
              <TouchableOpacity onPress={() => setShowBackpack(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>📦 背包內容</Text>
              <Text style={styles.backpackDescription}>收集來的道具都放這裡～</Text>
              <Text style={styles.backpackSubDescription}>查看你擁有的食物與各種道具</Text>
              
              <View style={styles.backpackContent}>
                <View style={styles.backpackSection}>
                  <Text style={styles.subSectionTitle}>🍖 食物</Text>
                  <View style={styles.itemList}>
                    {Object.entries(backpack.food).map(([id, item]) => (
                      <View key={id} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        <TouchableOpacity 
                          style={[styles.useButton, item.quantity === 0 && styles.disabledButton]} 
                          disabled={item.quantity === 0}
                          onPress={() => prepareFoodItem(id)}
                        >
                          <Text style={[styles.useButtonText, item.quantity === 0 && styles.disabledButtonText]}>準備</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.backpackSection}>
                  <Text style={styles.subSectionTitle}>🎾 玩具</Text>
                  <View style={styles.itemList}>
                    {Object.entries(backpack.toys).map(([id, item]) => (
                      <View key={id} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        <TouchableOpacity 
                          style={[styles.useButton, item.quantity === 0 && styles.disabledButton]} 
                          disabled={item.quantity === 0}
                          onPress={() => prepareToyItem(id)}
                        >
                          <Text style={[styles.useButtonText, item.quantity === 0 && styles.disabledButtonText]}>準備</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* 美容服務區域 */}
                <View style={styles.backpackSection}>
                  <Text style={styles.subSectionTitle}>💅 美容服務</Text>
                  <View style={styles.itemList}>
                    {Object.entries(backpack.grooming).map(([id, item]) => (
                      <View key={id} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        <TouchableOpacity 
                          style={[styles.useButton, item.quantity === 0 && styles.disabledButton]} 
                          disabled={item.quantity === 0}
                          onPress={() => prepareGroomingItem(id)}
                        >
                          <Text style={[styles.useButtonText, item.quantity === 0 && styles.disabledButtonText]}>準備</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* 特殊道具區域 */}
                <View style={styles.backpackSection}>
                  <Text style={styles.subSectionTitle}>⚡ 特殊道具</Text>
                  <View style={styles.itemList}>
                    {Object.entries(backpack.special).map(([id, item]) => (
                      <View key={id} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        <TouchableOpacity style={styles.useButton} disabled={item.quantity === 0}>
                          <Text style={[styles.useButtonText, item.quantity === 0 && styles.disabledButtonText]}>使用</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.iceCoinSection}>
                  <Text style={styles.subSectionTitle}>💰 冰晶藍幣</Text>
                  <View style={styles.iceCoinDisplay}>
                    <Image 
                      source={require('./B/M.png')} 
                      style={styles.iceCoinIcon}
                      onError={(error) => console.log('背包冰晶藍幣圖片載入失敗:', error)}
                      onLoad={() => console.log('背包冰晶藍幣圖片載入成功')}
                    />
                    <Text style={styles.iceCoinAmount}>{backpack.iceCoins}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 記帳頁面 */}
      {showAccountingPage && (
        <View style={styles.accountingPage}>
          <View style={styles.accountingHeader}>
            <TouchableOpacity onPress={() => setShowAccountingPage(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1976D2" />
              </TouchableOpacity>
            <Text style={styles.title}>🧾 {tt('accountingPage')}</Text>
            <View style={{ width: 24 }} />
              </View>
              
          <ScrollView style={styles.accountingContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* 金額輸入 */}
            <View style={styles.accountingSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{tt('inputAmount')}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="例如 150"
                keyboardType="numeric"
                value={amountInput}
                onChangeText={setAmountInput}
                placeholderTextColor="#999"
              />
              </View>
              
            {/* 類型切換 */}
            <View style={styles.accountingSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{tt('type')}</Text>
              <View style={styles.typeToggleRow}>
                  <TouchableOpacity 
                  style={[styles.typeButton, transactionType === 'expense' && styles.typeButtonActive]}
                  onPress={() => setTransactionType('expense')}
                  >
                  <Text style={[styles.typeButtonText, isDarkTheme && { color: themeColors.text }, transactionType === 'expense' && styles.typeButtonTextActive]}>支出</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                  style={[styles.typeButton, transactionType === 'income' && styles.typeButtonActive]}
                  onPress={() => setTransactionType('income')}
                  >
                  <Text style={[styles.typeButtonText, isDarkTheme && { color: themeColors.text }, transactionType === 'income' && styles.typeButtonTextActive]}>收入</Text>
                  </TouchableOpacity>
              </View>
            </View>

            {/* 類別選擇 */}
            <View style={styles.accountingSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{tt('category')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryChipsRow}>
                  {accountingCategories
                    .filter(cat => cat.type === transactionType)
                    .map(cat => (
                  <TouchableOpacity 
                        key={cat.id}
                        style={[styles.categoryChip, isDarkTheme && { backgroundColor: '#0B1220', borderColor: '#334155' }, transactionCategory === cat.id && styles.categoryChipActive]}
                        onPress={() => setTransactionCategory(cat.id)}
                      >
                        <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                        <Text style={[styles.categoryChipText, isDarkTheme && { color: themeColors.text }, transactionCategory === cat.id && styles.categoryChipTextActive]}>
                          {cat.id}
                        </Text>
                  </TouchableOpacity>
                    ))}
                </View>
              </ScrollView>
              </View>
              
            {/* 備註 */}
            <View style={styles.accountingSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{tt('note')}</Text>
                  <TextInput
                style={styles.noteInput}
                placeholder="可填寫店家/用途..."
                value={transactionNote}
                onChangeText={setTransactionNote}
                    placeholderTextColor="#999"
                  />
              </View>
              
            {/* 確認新增 */}
                  <TouchableOpacity 
              style={[styles.addTransactionButton, (!amountInput || parseInt(amountInput,10) <= 0) && styles.disabledButton]}
              onPress={handleAddTransaction}
              disabled={!amountInput || parseInt(amountInput,10) <= 0}
            >
              <Text style={styles.addTransactionButtonText}>新增</Text>
                  </TouchableOpacity>
                  
            {/* 月報表 */}
            <View style={styles.accountingSection}>
              <View style={styles.monthlyHeader}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{tt('monthlyReport')}</Text>
                <TouchableOpacity style={styles.monthSelector}>
                  <Text style={styles.monthSelectorText}>{selectedMonth.replace('-', '/')} ▾</Text>
                  </TouchableOpacity>
              </View>

              {(() => {
                const stats = getMonthlyStats(selectedMonth);
                return (
                  <View style={styles.monthlyStats}>
                    <View style={styles.monthlyOverview}>
                      <View style={styles.monthlyStatItem}>
                        <Text style={[styles.monthlyStatLabel, { color: themeColors.subText }]}>支出</Text>
                        <Text style={[styles.monthlyStatValue, { color: '#FF5252' }]}>
                          ${stats.totalExpense}
                        </Text>
                      </View>
                      <View style={styles.monthlyStatItem}>
                        <Text style={[styles.monthlyStatLabel, { color: themeColors.subText }]}>收入</Text>
                        <Text style={[styles.monthlyStatValue, { color: '#4CAF50' }]}>
                          ${stats.totalIncome}
                        </Text>
                      </View>
                      <View style={styles.monthlyStatItem}>
                        <Text style={[styles.monthlyStatLabel, { color: themeColors.subText }]}>結餘</Text>
                        <Text style={[styles.monthlyStatValue, { color: '#1976D2' }]}>
                          ${stats.totalIncome - stats.totalExpense}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.categoryStats}>
                      {stats.categoryStats
                        .filter(cat => cat.amount > 0)
                        .sort((a, b) => b.amount - a.amount)
                        .map(cat => (
                          <View key={cat.id} style={styles.categoryStatRow}>
                            <View style={styles.categoryStatLeft}>
                              <Text style={styles.categoryStatIcon}>{cat.icon}</Text>
                              <Text style={[styles.categoryStatName, { color: themeColors.text }]}>{cat.id}</Text>
                            </View>
                            <View style={styles.categoryStatRight}>
                              <Text style={styles.categoryStatAmount}>${cat.amount}</Text>
                              <Text style={[styles.categoryStatPercent, { color: themeColors.subText }] }>
                                {Math.round((cat.amount / stats.totalExpense) * 100)}%
                              </Text>
                            </View>
                          </View>
                        ))}
                    </View>
                  </View>
                );
              })()}
                </View>
                
            {/* 搜尋與篩選 */}
            <View style={styles.accountingSection}>
              <View style={styles.searchFilterHeader}>
                <View style={[styles.searchBox, isDarkTheme && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                  <Ionicons name="search" size={20} color="#666" />
                    <TextInput
                    style={styles.searchInput}
                    placeholder="搜尋備註或類別..."
                    value={searchText}
                    onChangeText={setSearchText}
                      placeholderTextColor="#999"
                    />
                </View>
                    <TouchableOpacity 
                  style={[
                    styles.filterButton,
                    isDarkTheme && { backgroundColor: '#1E293B', borderColor: '#334155' },
                    showFilter && styles.filterButtonActive
                  ]}
                  onPress={() => setShowFilter(!showFilter)}
                    >
                  <Ionicons name="filter" size={20} color={showFilter ? "#1976D2" : "#666"} />
                    </TouchableOpacity>
              </View>
              
              {showFilter && (
                <View style={[styles.filterPanel, isDarkTheme && { backgroundColor: '#0B1220', borderColor: '#334155' }]}>
                  <Text style={styles.filterTitle}>類別篩選</Text>
                  <View style={styles.filterChips}>
                    {accountingCategories.map(cat => (
              <TouchableOpacity 
                        key={cat.id}
                        style={[
                          styles.filterChip,
                          selectedCategories.includes(cat.id) && styles.filterChipActive
                        ]}
                        onPress={() => {
                          setSelectedCategories(prev =>
                            prev.includes(cat.id)
                              ? prev.filter(id => id !== cat.id)
                              : [...prev, cat.id]
                          );
                        }}
                      >
                        <Text style={styles.filterChipIcon}>{cat.icon}</Text>
                        <Text style={[
                          styles.filterChipText,
                          selectedCategories.includes(cat.id) && styles.filterChipTextActive
                        ]}>
                          {cat.id}
                        </Text>
              </TouchableOpacity>
                    ))}
          </View>
        </View>
              )}
            </View>
            
            {/* 交易列表 */}
            <View style={styles.accountingSection}>
              <Text style={styles.sectionTitle}>{tt('transactionList')}</Text>
              {filteredTransactions.length === 0 ? (
                <Text style={styles.emptyText}>尚無紀錄</Text>
              ) : (
                filteredTransactions.map(tx => {
                  if (!swipeAnimatedValues[tx.id]) {
                    swipeAnimatedValues[tx.id] = new Animated.Value(0);
                  }
                  return (
                    <Animated.View
                      key={tx.id}
                      style={[
                          styles.transactionContainer,
                          {
                            transform: [{
                              translateX: swipeAnimatedValues[tx.id].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -40]
                              })
                            }]
                          }
                        ]}
                    >
                      <View style={styles.transactionRowContainer}>
                        <Animated.View
                          {...createPanResponder(tx).panHandlers}
                          onLongPress={() => handleStartEdit(tx)}
                          delayLongPress={500}
                          style={[
                            styles.transactionRow,
                            {
                              transform: [{
                                translateX: swipeAnimatedValues[tx.id].interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -40]
                                })
                              }]
                            }
                          ]}
                        >
                        <Text style={[
                          styles.transactionAmount,
                          { color: tx.type === 'expense' ? '#FF5252' : '#4CAF50' }
                        ]}>
                          {tx.type === 'expense' ? '-' : '+'}${tx.amount}
                  </Text>
                        <View style={styles.transactionInfo}>
                          <View style={styles.transactionCategory}>
                            <Text style={styles.transactionCategoryIcon}>
                              {accountingCategories.find(cat => cat.id === tx.category)?.icon}
                            </Text>
                            <Text style={styles.transactionCategoryText}>{tx.category}</Text>
                </View>
                          {!!tx.note && <Text style={styles.transactionNote}>{tx.note}</Text>}
                </View>
                        <Text style={styles.transactionDate}>
                          {new Date(tx.date).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          }).replace(/\//g, '/')}
                    </Text>
                        </Animated.View>
                      <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDeleteTransaction(tx.id)}
                      >
                          <Ionicons name="trash-outline" size={16} color="white" />
                      </TouchableOpacity>
                  </View>
                    </Animated.View>
                  );
                })
                )}
              </View>
          </ScrollView>
        </View>
      )}

      {/* 編輯交易模態框 */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ 編輯交易</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
                </View>
                
            <ScrollView style={styles.modalContent}>
              {/* 金額輸入 */}
              <View style={styles.accountingSection}>
                <Text style={styles.sectionTitle}>金額</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="例如 150"
                  keyboardType="numeric"
                  value={editAmount}
                  onChangeText={setEditAmount}
                  placeholderTextColor="#999"
                />
                </View>
                
              {/* 類型切換 */}
              <View style={styles.accountingSection}>
                <Text style={styles.sectionTitle}>類型</Text>
                <View style={styles.typeToggleRow}>
                  <TouchableOpacity
                    style={[styles.typeButton, editType === 'expense' && styles.typeButtonActive]}
                    onPress={() => setEditType('expense')}
                  >
                    <Text style={[styles.typeButtonText, editType === 'expense' && styles.typeButtonTextActive]}>支出</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, editType === 'income' && styles.typeButtonActive]}
                    onPress={() => setEditType('income')}
                  >
                    <Text style={[styles.typeButtonText, editType === 'income' && styles.typeButtonTextActive]}>收入</Text>
                  </TouchableOpacity>
                </View>
                </View>
                
              {/* 類別選擇 */}
              <View style={styles.accountingSection}>
                <Text style={styles.sectionTitle}>類別</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryChipsRow}>
                    {accountingCategories
                      .filter(cat => cat.type === editType)
                      .map(cat => (
                      <TouchableOpacity 
                          key={cat.id}
                          style={[styles.categoryChip, editCategory === cat.id && styles.categoryChipActive]}
                          onPress={() => setEditCategory(cat.id)}
                      >
                          <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                          <Text style={[styles.categoryChipText, editCategory === cat.id && styles.categoryChipTextActive]}>
                            {cat.id}
                          </Text>
                      </TouchableOpacity>
                      ))}
                  </View>
                </ScrollView>
              </View>

              {/* 備註 */}
              <View style={styles.accountingSection}>
                <Text style={styles.sectionTitle}>備註</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="可填寫店家/用途..."
                  value={editNote}
                  onChangeText={setEditNote}
                  placeholderTextColor="#999"
                />
                </View>
                
              {/* 確認編輯 */}
                      <TouchableOpacity 
                style={[styles.addTransactionButton, (!editAmount || parseInt(editAmount,10) <= 0) && styles.disabledButton]}
                onPress={handleSaveEdit}
                disabled={!editAmount || parseInt(editAmount,10) <= 0}
                      >
                <Text style={styles.addTransactionButtonText}>儲存</Text>
                      </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 存錢模態框 */}
      <Modal
        visible={showShop}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShop(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🛍️ 冰冰商店</Text>
              <TouchableOpacity onPress={() => setShowShop(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>🛍️ 冰冰商店</Text>
              <Text style={styles.shopDescription}>用冰冰幣購買各種道具，讓寵物更開心！</Text>
              
              <View style={styles.shopBalance}>
                <Image 
                  source={require('./B/M.png')} 
                  style={styles.shopIceCoinIcon}
                  onError={(error) => console.log('商店冰晶藍幣圖片載入失敗:', error)}
                  onLoad={() => console.log('商店冰晶藍幣圖片載入成功')}
                />
                <Text style={styles.shopBalanceText}>餘額：{backpack.iceCoins} 冰冰幣</Text>
              </View>
              
              <ScrollView style={styles.shopContent} showsVerticalScrollIndicator={false}>
                <View style={styles.shopGrid}>
                   {/* 高級飼料 */}
                   <View style={styles.shopSection}>
                     <Text style={styles.shopSectionTitle}>🍖 高級飼料</Text>
                     <View style={styles.itemGrid}>
                       {shopItems.food.map((item, index) => (
                         <TouchableOpacity 
                           key={item.id} 
                           style={styles.shopItem}
                           onPress={() => handlePurchase({...item, category: 'food'})}
                         >
                           <Text style={styles.itemIcon}>{item.icon}</Text>
                           <Text style={styles.itemTitle}>{item.name}</Text>
                           <Text style={styles.itemDescription}>{item.description}</Text>
                           <View style={styles.priceContainer}>
                             <Image 
                               source={require('./B/M.png')} 
                               style={styles.priceIcon}
                               onError={(error) => console.log('食物價格圖標載入失敗:', error)}
                               onLoad={() => console.log('食物價格圖標載入成功')}
                             />
                             <Text style={styles.priceText}>{item.price}</Text>
                           </View>
                         </TouchableOpacity>
                       ))}
                     </View>
                   </View>
                   
                   {/* 寵物玩具 */}
                   <View style={styles.shopSection}>
                     <Text style={styles.shopSectionTitle}>🎾 寵物玩具</Text>
                     <View style={styles.itemGrid}>
                       {shopItems.toys.map((item, index) => (
                         <TouchableOpacity 
                           key={item.id} 
                           style={styles.shopItem}
                           onPress={() => handlePurchase({...item, category: 'toys'})}
                         >
                           <Text style={styles.itemIcon}>{item.icon}</Text>
                           <Text style={styles.itemTitle}>{item.name}</Text>
                           <Text style={styles.itemDescription}>{item.description}</Text>
                           <View style={styles.priceContainer}>
                             <Image 
                               source={require('./B/M.png')} 
                               style={styles.priceIcon}
                               onError={(error) => console.log('玩具價格圖標載入失敗:', error)}
                               onLoad={() => console.log('玩具價格圖標載入成功')}
                             />
                             <Text style={styles.priceText}>{item.price}</Text>
                           </View>
                         </TouchableOpacity>
                       ))}
                     </View>
                                     </View>
                  
                  {/* 寵物美容 */}
                   <View style={styles.shopSection}>
                     <Text style={styles.shopSectionTitle}>💅 寵物美容</Text>
                     <View style={styles.itemGrid}>
                       {shopItems.grooming.map((item, index) => (
                         <TouchableOpacity 
                           key={item.id} 
                           style={styles.shopItem}
                           onPress={() => handlePurchase({...item, category: 'grooming'})}
                         >
                           <Text style={styles.itemIcon}>{item.icon}</Text>
                           <Text style={styles.itemTitle}>{item.name}</Text>
                           <Text style={styles.itemDescription}>{item.description}</Text>
                           <View style={styles.priceContainer}>
                             <Image 
                               source={require('./B/M.png')} 
                               style={styles.priceIcon}
                               onError={(error) => console.log('美容價格圖標載入失敗:', error)}
                               onLoad={() => console.log('美容價格圖標載入成功')}
                             />
                             <Text style={styles.priceText}>{item.price}</Text>
                           </View>
                         </TouchableOpacity>
                       ))}
                     </View>
                   </View>
                   
                   {/* 特殊道具 */}
                   <View style={styles.shopSection}>
                     <Text style={styles.shopSectionTitle}>⚡ 特殊道具</Text>
                     <View style={styles.itemGrid}>
                       {shopItems.special.map((item, index) => (
                         <TouchableOpacity 
                           key={item.id} 
                           style={styles.shopItem}
                           onPress={() => handlePurchase({...item, category: 'special'})}
                         >
                           <Text style={styles.itemIcon}>{item.icon}</Text>
                           <Text style={styles.itemTitle}>{item.name}</Text>
                           <Text style={styles.itemDescription}>{item.description}</Text>
                           <View style={styles.priceContainer}>
                             <Image 
                               source={require('./B/M.png')} 
                               style={styles.priceIcon}
                               onError={(error) => console.log('特殊道具價格圖標載入失敗:', error)}
                               onLoad={() => console.log('特殊道具價格圖標載入成功')}
                             />
                             <Text style={styles.priceText}>{item.price}</Text>
                           </View>
                         </TouchableOpacity>
                       ))}
                     </View>
                   </View>
                 </View>
               </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* 餵食確認框 */}
      <Modal
        visible={showFeedConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          // 返回鍵取消時也要歸還食物
          if (preparedFood) {
            setBackpack(prev => ({
              ...prev,
              food: {
                ...prev.food,
                [preparedFood.id]: {
                  ...prev.food[preparedFood.id],
                  quantity: prev.food[preparedFood.id].quantity + 1
                }
              }
            }));
            setPreparedFood(null);
          }
          setShowFeedConfirm(false);
        }}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmModalHeader}>
              <Text style={styles.confirmModalTitle}>🍖 確認餵食</Text>
            </View>
            
            <View style={styles.confirmModalContent}>
              {preparedFood && (
                <>
                  <Text style={styles.confirmText}>確定要使用以下食物餵食寵物嗎？</Text>
                  
                  <View style={styles.foodItemDisplay}>
                    <Text style={styles.foodItemName}>{preparedFood.name}</Text>
                    <Text style={styles.foodItemQuantity}>數量：1</Text>
                    <Text style={styles.foodItemEffect}>效果：飽食度 +{preparedFood.hungerIncrease}%</Text>
                  </View>
                </>
              )}
            </View>
            
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={() => {
                  // 取消時將食物歸還到背包
                  if (preparedFood) {
                    setBackpack(prev => ({
                      ...prev,
                      food: {
                        ...prev.food,
                        [preparedFood.id]: {
                          ...prev.food[preparedFood.id],
                          quantity: prev.food[preparedFood.id].quantity + 1
                        }
                      }
                    }));
                    setPreparedFood(null);
                  }
                  setShowFeedConfirm(false);
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, styles.confirmButtonActive]} 
                onPress={confirmFeed}
              >
                <Text style={styles.confirmButtonText}>確認餵食</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 玩耍確認框 */}
      <Modal
        visible={showPlayConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          // 返回鍵取消時也要歸還玩具
          if (preparedToy) {
            setBackpack(prev => ({
              ...prev,
              toys: {
                ...prev.toys,
                [preparedToy.id]: {
                  ...prev.toys[preparedToy.id],
                  quantity: prev.toys[preparedToy.id].quantity + 1
                }
              }
            }));
            setPreparedToy(null);
          }
          setShowPlayConfirm(false);
        }}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmModalHeader}>
              <Text style={styles.confirmModalTitle}>⚽ 確認玩耍</Text>
            </View>
            
            <View style={styles.confirmModalContent}>
              {preparedToy && (
                <>
                  <Text style={styles.confirmText}>確定要使用以下玩具和寵物玩耍嗎？</Text>
                  
                  <View style={styles.toyItemDisplay}>
                    <Text style={styles.toyItemName}>{preparedToy.name}</Text>
                    <Text style={styles.toyItemQuantity}>數量：1</Text>
                    <Text style={styles.toyItemEffect}>效果：親密度 +{preparedToy.affectionIncrease}%</Text>
                  </View>
                </>
              )}
            </View>
            
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={() => {
                  // 取消時將玩具歸還到背包
                  if (preparedToy) {
                    setBackpack(prev => ({
                      ...prev,
                      toys: {
                        ...prev.toys,
                        [preparedToy.id]: {
                          ...prev.toys[preparedToy.id],
                          quantity: prev.toys[preparedToy.id].quantity + 1
                        }
                      }
                    }));
                    setPreparedToy(null);
                  }
                  setShowPlayConfirm(false);
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, styles.confirmButtonActive]} 
                onPress={confirmPlay}
              >
                <Text style={styles.confirmButtonText}>確認玩耍</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 清潔確認框 */}
      <Modal
        visible={showCleanConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          // 返回鍵取消時也要歸還美容服務
          if (preparedGrooming) {
            setBackpack(prev => ({
              ...prev,
              grooming: {
                ...prev.grooming,
                [preparedGrooming.id]: {
                  ...prev.grooming[preparedGrooming.id],
                  quantity: prev.grooming[preparedGrooming.id].quantity + 1
                }
              }
            }));
            setPreparedGrooming(null);
          }
          setShowCleanConfirm(false);
        }}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmModalHeader}>
              <Text style={styles.confirmModalTitle}>🛁 確認清潔</Text>
            </View>
            
            <View style={styles.confirmModalContent}>
              {preparedGrooming && (
                <>
                  <Text style={styles.confirmText}>確定要享受以下美容服務嗎？</Text>
                  
                  <View style={styles.groomingItemDisplay}>
                    <Text style={styles.groomingItemName}>{preparedGrooming.name}</Text>
                    <Text style={styles.groomingItemQuantity}>數量：1</Text>
                    <Text style={styles.groomingItemEffect}>效果：清潔度 +{preparedGrooming.cleanlinessIncrease}%</Text>
                  </View>
                </>
              )}
            </View>
            
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={() => {
                  // 取消時將美容服務歸還到背包
                  if (preparedGrooming) {
                    setBackpack(prev => ({
                      ...prev,
                      grooming: {
                        ...prev.grooming,
                        [preparedGrooming.id]: {
                          ...prev.grooming[preparedGrooming.id],
                          quantity: prev.grooming[preparedGrooming.id].quantity + 1
                        }
                      }
                    }));
                    setPreparedGrooming(null);
                  }
                  setShowCleanConfirm(false);
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, styles.confirmButtonActive]} 
                onPress={confirmClean}
              >
                <Text style={styles.confirmButtonText}>確認清潔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 存錢頁面 */}
      {showSavingsPage && (
        <View style={styles.accountingPage}>
          <View style={styles.accountingHeader}>
            <TouchableOpacity onPress={() => setShowSavingsPage(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1976D2" />
            </TouchableOpacity>
            <Text style={styles.title}>💰 {tt('savingsPage')}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.accountingContent} showsVerticalScrollIndicator={false}>
            {/* 標題區塊 */}
            <View style={styles.piggyBankHeader}>
              <Text style={styles.piggyBankTitle}>💎 {tt('savingsFeature')}</Text>
              <Text style={styles.piggyBankDescription}>設定目標，養成儲蓄的好習慣！</Text>
            </View>
            {/* 餘額顯示區塊 */}
            <View style={styles.piggyBankBalance}>
              <Ionicons name="wallet" size={22} color="#1976D2" />
              <Text style={styles.piggyBankBalanceText}>目前累積儲蓄：{savedMoney} 元</Text>
            </View>
            {/* 存入金額區塊 */}
            <View style={[styles.withdrawSection, { backgroundColor: '#FFF3E0', borderColor: '#FF9800' }]}>
              <Text style={[styles.withdrawSectionTitle, { color: '#FF9800' }]}>💰 {tt('depositSection')}</Text>
              <Text style={[styles.withdrawSectionDescription, { color: '#E65100' }]}>當前儲蓄餘額：{savedMoney} 元</Text>
              {dreamPlans.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={[styles.withdrawSectionDescription, { marginBottom: 6, color: '#E65100' }]}>選擇存入的夢想計畫：</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {dreamPlans.map(plan => (
                      <TouchableOpacity
                        key={plan.id}
                        onPress={() => setSelectedDreamPlanId(plan.id)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: selectedDreamPlanId === plan.id ? '#1976D2' : '#E0E0E0',
                          backgroundColor: selectedDreamPlanId === plan.id ? '#E3F2FD' : '#FFFFFF',
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: selectedDreamPlanId === plan.id ? '#1976D2' : '#333' }}>{plan.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              <View style={styles.withdrawCustomAmount}>
                <Text style={[styles.withdrawCustomAmountLabel, { color: '#E65100' }]}>{tt('depositAmount')}</Text>
                <View style={styles.customAmountRow}>
                  <TextInput
                    style={styles.depositCustomAmountInput}
                    placeholder="輸入金額"
                    keyboardType="numeric"
                    value={depositAmount}
                    maxLength={6}
                    onChangeText={(t) => setDepositAmount(t.replace(/[^0-9]/g,'').slice(0,6))}
                    placeholderTextColor="#FFA726"
                  />
                  <TouchableOpacity 
                    style={[
                      styles.withdrawCustomAmountButton,
                      { backgroundColor: (!depositAmount || parseInt(depositAmount) <= 0) ? '#E0E0E0' : '#FF9800' },
                      (!depositAmount || parseInt(depositAmount) <= 0) && styles.disabledButton
                    ]}
                    onPress={() => handleSaveMoney(parseInt(depositAmount))}
                    disabled={!depositAmount || parseInt(depositAmount) <= 0}
                  >
                    <Text style={styles.withdrawCustomAmountButtonText}>{tt('depositAction')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* 取出功能區塊 */}
            <View style={styles.withdrawSection}>
              <Text style={styles.withdrawSectionTitle}>💸 {tt('withdrawSection')}</Text>
              <Text style={styles.withdrawSectionDescription}>當前儲蓄餘額：{savedMoney} 元</Text>
              {dreamPlans.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={[styles.withdrawSectionDescription, { marginBottom: 6 }]}>選擇取出的夢想計畫：</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {dreamPlans.map(plan => (
                      <TouchableOpacity
                        key={plan.id}
                        onPress={() => setSelectedWithdrawDreamPlanId(plan.id)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: selectedWithdrawDreamPlanId === plan.id ? '#1976D2' : '#E0E0E0',
                          backgroundColor: selectedWithdrawDreamPlanId === plan.id ? '#E3F2FD' : '#FFFFFF',
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: selectedWithdrawDreamPlanId === plan.id ? '#1976D2' : '#333' }}>{plan.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              <View style={styles.withdrawCustomAmount}>
                <Text style={styles.withdrawCustomAmountLabel}>{tt('withdrawAmount')}</Text>
                <View style={styles.customAmountRow}>
                  <TextInput
                    style={styles.withdrawCustomAmountInput}
                    placeholder="輸入金額"
                    keyboardType="numeric"
                    value={withdrawAmount}
                    maxLength={6}
                    onChangeText={(t) => setWithdrawAmount(t.replace(/[^0-9]/g,'').slice(0,6))}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity 
                    style={[styles.withdrawCustomAmountButton, (!withdrawAmount || parseInt(withdrawAmount) <= 0 || parseInt(withdrawAmount) > savedMoney) && styles.disabledButton]}
                    onPress={() => handleWithdrawMoney(parseInt(withdrawAmount))}
                    disabled={!withdrawAmount || parseInt(withdrawAmount) <= 0 || parseInt(withdrawAmount) > savedMoney}
                  >
                    <Text style={styles.withdrawCustomAmountButtonText}>{tt('withdrawAction')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* 目標進度（夢想存錢） */}
            <View style={styles.accountingSection}>
              <Text style={styles.sectionTitle}>{tt('goalsProgress')}</Text>
              {dreamPlans.length === 0 && (
                <Text style={{ fontSize: 14, color: '#757575', marginBottom: 10 }}>尚未建立夢想存錢計畫，點擊下方「夢想存錢」新增吧！</Text>
              )}
              {dreamPlans.map(plan => (
                <View key={plan.id} style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: '#424242', marginBottom: 6 }}>⭐ {plan.title}</Text>
                  {!!plan.target ? (
                    <>
                      <View style={styles.goalProgressBar}>
                        <View style={[styles.goalProgressFill, { width: `${calculateGoalProgress(plan.current || 0, plan.target)}%` }]} />
                      </View>
                      <Text style={{ fontSize: 12, color: '#757575', marginTop: 4 }}>
                        進度：{plan.current || 0} / {plan.target} 元
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 12, color: '#9E9E9E' }}>未設定目標金額</Text>
                  )}
                </View>
              ))}
              <TouchableOpacity 
                style={[styles.viewGoalsButton, { backgroundColor: '#1976D2' }]}
                onPress={() => setShowDreamSavingsPage(true)}
              >
                <Text style={styles.viewGoalsButtonText}>⭐ {tt('dreamSavings')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* 存錢目標編輯頁面 */}
      {showGoalEditPage && (
        <View style={styles.goalEditPage}>
          <View style={styles.goalEditHeader}>
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={() => setShowGoalEditPage(false)}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.goalEditTitle}>編輯存錢目標</Text>
          </View>
          
          <ScrollView style={styles.goalEditContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* 短期目標編輯 */}
            <View style={styles.goalEditForm}>
              <Text style={styles.goalEditLabel}>⏰ 短期目標</Text>
              
              <Text style={[styles.goalEditLabel, { fontSize: 14, color: '#666' }]}>目標金額</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.goalEditInput, { flex: 1 }]}
                  placeholder="請輸入目標金額"
                  keyboardType="numeric"
                  value={savingsGoals.shortTerm.target.toString()}
                  onChangeText={(t) => setSavingsGoal('shortTerm', t.replace(/[^0-9]/g,''), savingsGoals.shortTerm.days)}
                />
                <Text style={{ marginLeft: 8, color: '#666' }}>元</Text>
              </View>
              
              <Text style={[styles.goalEditLabel, { fontSize: 14, color: '#666' }]}>目標天數</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.goalEditInput, { flex: 1 }]}
                  placeholder="請輸入目標天數"
                  keyboardType="numeric"
                  value={savingsGoals.shortTerm.days.toString()}
                  onChangeText={(t) => setSavingsGoal('shortTerm', savingsGoals.shortTerm.target, t.replace(/[^0-9]/g,''))}
                />
                <Text style={{ marginLeft: 8, color: '#666' }}>天</Text>
              </View>
              
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, { width: `${calculateGoalProgress(savingsGoals.shortTerm.current, savingsGoals.shortTerm.target)}%` }]} />
              </View>
              <Text style={styles.goalProgressText}>
                目前進度：{savingsGoals.shortTerm.current} / {savingsGoals.shortTerm.target} 元
              </Text>
              <Text style={styles.goalDeadline}>
                截止日期：{new Date(savingsGoals.shortTerm.deadline).toLocaleDateString()}
              </Text>
            </View>

            {/* 中期目標編輯 */}
            <View style={styles.goalEditForm}>
              <Text style={styles.goalEditLabel}>📅 中期目標</Text>
              
              <Text style={[styles.goalEditLabel, { fontSize: 14, color: '#666' }]}>目標金額</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.goalEditInput, { flex: 1 }]}
                  placeholder="請輸入目標金額"
                  keyboardType="numeric"
                  value={savingsGoals.mediumTerm.target.toString()}
                  onChangeText={(t) => setSavingsGoal('mediumTerm', t.replace(/[^0-9]/g,''), savingsGoals.mediumTerm.days)}
                />
                <Text style={{ marginLeft: 8, color: '#666' }}>元</Text>
              </View>
              
              <Text style={[styles.goalEditLabel, { fontSize: 14, color: '#666' }]}>目標天數</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.goalEditInput, { flex: 1 }]}
                  placeholder="請輸入目標天數"
                  keyboardType="numeric"
                  value={savingsGoals.mediumTerm.days.toString()}
                  onChangeText={(t) => setSavingsGoal('mediumTerm', savingsGoals.mediumTerm.target, t.replace(/[^0-9]/g,''))}
                />
                <Text style={{ marginLeft: 8, color: '#666' }}>天</Text>
              </View>
              
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, { width: `${calculateGoalProgress(savingsGoals.mediumTerm.current, savingsGoals.mediumTerm.target)}%` }]} />
              </View>
              <Text style={styles.goalProgressText}>
                目前進度：{savingsGoals.mediumTerm.current} / {savingsGoals.mediumTerm.target} 元
              </Text>
              <Text style={styles.goalDeadline}>
                截止日期：{new Date(savingsGoals.mediumTerm.deadline).toLocaleDateString()}
              </Text>
            </View>

            {/* 長期目標編輯 */}
            <View style={styles.goalEditForm}>
              <Text style={styles.goalEditLabel}>📆 長期目標</Text>
              
              <Text style={[styles.goalEditLabel, { fontSize: 14, color: '#666' }]}>目標金額</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.goalEditInput, { flex: 1 }]}
                  placeholder="請輸入目標金額"
                  keyboardType="numeric"
                  value={savingsGoals.longTerm.target.toString()}
                  onChangeText={(t) => setSavingsGoal('longTerm', t.replace(/[^0-9]/g,''), savingsGoals.longTerm.days)}
                />
                <Text style={{ marginLeft: 8, color: '#666' }}>元</Text>
              </View>
              
              <Text style={[styles.goalEditLabel, { fontSize: 14, color: '#666' }]}>目標天數</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.goalEditInput, { flex: 1 }]}
                  placeholder="請輸入目標天數"
                  keyboardType="numeric"
                  value={savingsGoals.longTerm.days.toString()}
                  onChangeText={(t) => setSavingsGoal('longTerm', savingsGoals.longTerm.target, t.replace(/[^0-9]/g,''))}
                />
                <Text style={{ marginLeft: 8, color: '#666' }}>天</Text>
              </View>
              
              <View style={styles.goalProgressBar}>
                <View style={[styles.goalProgressFill, { width: `${calculateGoalProgress(savingsGoals.longTerm.current, savingsGoals.longTerm.target)}%` }]} />
              </View>
              <Text style={styles.goalProgressText}>
                目前進度：{savingsGoals.longTerm.current} / {savingsGoals.longTerm.target} 元
              </Text>
              <Text style={styles.goalDeadline}>
                截止日期：{new Date(savingsGoals.longTerm.deadline).toLocaleDateString()}
              </Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* 夢想存錢頁面 */}
      {showDreamSavingsPage && (
        <View style={styles.dreamPage}>
          <View style={styles.dreamHeader}>
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={() => setShowDreamSavingsPage(false)}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.dreamTitle}>夢想存錢</Text>
          </View>

          <ScrollView style={styles.dreamContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.dreamForm}>
              <Text style={styles.dreamLabel}>計畫標題（必填）</Text>
              <TextInput
                style={styles.dreamInput}
                placeholder="例如：旅行基金"
                value={editingPlanId ? editingPlanForm.title : dreamForm.title}
                onChangeText={(t) => editingPlanId ? setEditingPlanForm(prev => ({ ...prev, title: t })) : setDreamForm(prev => ({ ...prev, title: t }))}
                placeholderTextColor="#999"
                maxLength={30}
              />

              <Text style={styles.dreamLabel}>目標金額（選填）</Text>
              <TextInput
                style={styles.dreamInput}
                placeholder="例如：30000"
                value={editingPlanId ? editingPlanForm.targetText : dreamForm.targetText}
                onChangeText={(t) => {
                  const v = t.replace(/[^0-9]/g,'').slice(0,9);
                  if (editingPlanId) setEditingPlanForm(prev => ({ ...prev, targetText: v }));
                  else setDreamForm(prev => ({ ...prev, targetText: v }));
                }}
                placeholderTextColor="#999"
                keyboardType="numeric"
              />

              <Text style={styles.dreamLabel}>起始日期（選填，YYYY/MM/DD）</Text>
              <TextInput
                style={styles.dreamInput}
                placeholder="例如：2025/01/01"
                value={editingPlanId ? editingPlanForm.startDateText : dreamForm.startDateText}
                onChangeText={(t) => editingPlanId ? setEditingPlanForm(prev => ({ ...prev, startDateText: t })) : setDreamForm(prev => ({ ...prev, startDateText: t }))}
                placeholderTextColor="#999"
              />

              <Text style={styles.dreamLabel}>結束日期（選填，YYYY/MM/DD）</Text>
              <TextInput
                style={styles.dreamInput}
                placeholder="例如：2025/12/31"
                value={editingPlanId ? editingPlanForm.endDateText : dreamForm.endDateText}
                onChangeText={(t) => editingPlanId ? setEditingPlanForm(prev => ({ ...prev, endDateText: t })) : setDreamForm(prev => ({ ...prev, endDateText: t }))}
                placeholderTextColor="#999"
              />

              <TouchableOpacity
                style={styles.dreamCreateButton}
                onPress={() => {
                  const title = dreamForm.title.trim();
                  if (!title) {
                    Alert.alert('❌ 建立失敗', '請輸入計畫標題');
                    return;
                  }
                  const target = dreamForm.targetText ? parseInt(dreamForm.targetText) : null;
                  const startDateText = dreamForm.startDateText ? dreamForm.startDateText.trim() : '';
                  const endDateText = dreamForm.endDateText ? dreamForm.endDateText.trim() : '';
                  if (editingPlanId) {
                    setDreamPlans(prev => prev.map(p => p.id === editingPlanId ? {
                      ...p,
                      title,
                      target,
                      startDateText,
                      endDateText,
                    } : p));
                    setEditingPlanId(null);
                    setEditingPlanForm({ title: '', targetText: '', startDateText: '', endDateText: '' });
                    Alert.alert('✅ 已更新', '已更新夢想存錢計畫');
                  } else {
                    const newPlan = {
                      id: Date.now(),
                      title,
                      target,
                      current: 0,
                      startDateText,
                      endDateText,
                      createdAt: new Date().toISOString(),
                    };
                    setDreamPlans(prev => [newPlan, ...prev]);
                    Alert.alert('✅ 已建立', '已新增夢想存錢計畫');
                  }
                  setDreamForm({ title: '', targetText: '', startDateText: '', endDateText: '' });
                }}
              >
                <Text style={styles.dreamCreateButtonText}>{editingPlanId ? '更新計畫' : '建立計畫'}</Text>
              </TouchableOpacity>
            </View>

            {dreamPlans.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1976D2', marginBottom: 10 }}>我的夢想清單</Text>
                {dreamPlans.map(plan => (
                  <View key={plan.id} style={styles.dreamPlanCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.dreamPlanTitle}>⭐ {plan.title}</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity onPress={() => {
                          setEditingPlanId(plan.id);
                          setEditingPlanForm({
                            title: plan.title,
                            targetText: plan.target ? String(plan.target) : '',
                            startDateText: plan.startDateText || '',
                            endDateText: plan.endDateText || '',
                          });
                        }}>
                          <Text style={{ color: '#1976D2', fontWeight: '700' }}>編輯</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                          Alert.alert('刪除確認', `確定刪除「${plan.title}」？`, [
                            { text: '取消', style: 'cancel' },
                            { text: '刪除', style: 'destructive', onPress: () => setDreamPlans(prev => prev.filter(p => p.id !== plan.id)) }
                          ]);
                        }}>
                          <Text style={{ color: '#D32F2F', fontWeight: '700' }}>刪除</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {!!plan.target && (
                      <Text style={styles.dreamPlanMeta}>目標金額：{plan.target} 元</Text>
                    )}
                    {(plan.startDateText || plan.endDateText) && (
                      <Text style={styles.dreamPlanMeta}>
                        期間：{plan.startDateText || '—'} ~ {plan.endDateText || '—'}
                      </Text>
                    )}

                    {!!plan.target && (
                      <>
                        <View style={styles.goalProgressBar}>
                          <View style={[styles.goalProgressFill, { width: `${calculateGoalProgress(plan.current || 0, plan.target)}%` }]} />
                        </View>
                        <Text style={{ fontSize: 12, color: '#757575', marginTop: 4 }}>進度：{plan.current || 0} / {plan.target} 元</Text>
                        {(() => { const s = calculateSuggestedDaily(plan.current || 0, plan.target, plan.endDateText); return s !== null ? (
                          <Text style={{ fontSize: 12, color: '#1976D2', marginTop: 2 }}>建議每日至少存：{s} 元</Text>
                        ) : null; })()}
                      </>
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <TextInput
                        style={[styles.dreamInput, { flex: 1, marginBottom: 0 }]}
                        placeholder="快速存入金額"
                        value={dreamPlanInputs[plan.id] ?? ''}
                        onChangeText={(t) => setDreamPlanInputs(prev => ({ ...prev, [plan.id]: t.replace(/[^0-9]/g,'').slice(0,9) }))}
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        style={[styles.dreamCreateButton, { marginTop: 0, marginLeft: 8 }]}
                        onPress={() => {
                          const v = dreamPlanInputs[plan.id];
                          const amount = v ? parseInt(v) : 0;
                          handleSaveMoneyToPlan(amount, plan.id);
                        }}
                      >
                        <Text style={styles.dreamCreateButtonText}>存入</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.dreamPlanMeta, { color: '#9E9E9E', marginTop: 6 }]}>建立於 {new Date(plan.createdAt).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FBFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotion: {
    fontSize: 24,
    marginRight: 10,
  },
  iceCoinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iceCoinIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  iceCoinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  petDisplayArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
  },
  roomBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  petContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  petImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: 40,
  },
  speechBubble: {
    position: 'absolute',
    top: -10,
    right: -50,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  statusBars: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 20,
    width: 30,
  },
  progressContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  hungerBar: {
    backgroundColor: '#FF6B6B',
  },
  cleanlinessBar: {
    backgroundColor: '#4ECDC4',
  },
  affectionBar: {
    backgroundColor: '#FFE66D',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  statusValueLight: {
    color: '#1B1B1B',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    overflow: 'hidden',
  },
  statusValueDark: {
    color: '#EDEFF2',
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  interactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
  },
  feedButtonContainer: {
    alignItems: 'center',
  },
  playButtonContainer: {
    alignItems: 'center',
  },
  cleanButtonContainer: {
    alignItems: 'center',
  },
  interactionButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  interactionButtonReady: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  preparedFoodText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  preparedToyText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  preparedGroomingText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
  },
  newFunctionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#F0F8FF',
  },
  newFunctionButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newFunctionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  newFunctionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  // 記帳按鈕特別樣式
  accountingButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    minWidth: 60,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#90CAF9',
  },
  accountingButtonIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  accountingButtonText: {
    fontSize: 11,
    color: '#1565C0',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // 背包按鈕特別樣式
  backpackButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3E5F5',
    borderRadius: 14,
    minWidth: 60,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#CE93D8',
  },
  backpackButtonIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  backpackButtonText: {
    fontSize: 11,
    color: '#7B1FA2',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // 商店按鈕特別樣式
  shopButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 14,
    minWidth: 60,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#A5D6A7',
  },
  shopButtonIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  shopButtonText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // 存錢按鈕特別樣式
  savingsButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFE0B2',
    borderRadius: 16,
    minWidth: 60,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFB74D',
    transform: [{ scale: 1 }],
  },
  savingsButtonIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  savingsButtonText: {
    fontSize: 11,
    color: '#E65100',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  // 背包專用模態框樣式
  backpackModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '95%',
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  // 背包系統樣式
  backpackDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  backpackSubDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  backpackContent: {
    flex: 1,
  },
  backpackSection: {
    marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  itemList: {
    backgroundColor: '#F8FBFF',
    borderRadius: 10,
    padding: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  useButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  useButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iceCoinSection: {
    marginTop: 20,
  },
  iceCoinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderRadius: 10,
    padding: 15,
  },
  iceCoinAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 10,
  },

  // 商店樣式
  shopDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  shopBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FBFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  shopIceCoinIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  shopBalanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  shopContent: {
    flex: 1,
    paddingBottom: 20,
  },
  shopGrid: {
    flexDirection: 'column',
  },
  shopSection: {
    marginBottom: 25,
  },
  shopSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
    textAlign: 'center',
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shopItem: {
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1976D2',
    minHeight: 120,
  },
  itemIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
    textAlign: 'center',
  },
  itemDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  priceIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 10,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: 'bold',
    marginLeft: 'auto',
    marginRight: 10,
  },
  disabledButtonText: {
    color: '#999',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  // 餵食確認框樣式
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmModalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  confirmModalContent: {
    padding: 20,
  },
  confirmText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  foodItemDisplay: {
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  
  // 存錢模態框樣式
  piggyBankModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '98%',
    maxHeight: '98%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  piggyBankHeader: {
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  piggyBankTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
    textAlign: 'center',
  },
  piggyBankDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  piggyBankBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FBFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  piggyBankIceCoinIcon: {
    width: 32,
    height: 32,
    marginRight: 15,
  },
  piggyBankBalanceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  piggyBankOptions: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  piggyBankOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  piggyBankAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  piggyBankAmountButton: {
    width: '47%',
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1976D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledAmountButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  piggyBankAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  disabledAmountText: {
    color: '#999',
  },
  piggyBankAmountLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  disabledAmountLabel: {
    color: '#999',
  },
  piggyBankCustomAmount: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  piggyBankCustomAmountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  customAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  piggyBankCustomAmountInput: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E3F2FD',
    fontSize: 14,
    textAlign: 'center',
  },
  piggyBankCustomAmountButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  piggyBankCustomAmountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  piggyBankInfo: {
    backgroundColor: '#FFF3E0',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
    marginHorizontal: 20,
    marginBottom: 25,
  },
  piggyBankInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 15,
    textAlign: 'center',
  },
  piggyBankInfoText: {
    fontSize: 15,
    color: '#E65100',
    marginBottom: 10,
    lineHeight: 22,
  },
  viewGoalsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewGoalsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // 取出功能樣式
  withdrawSection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginHorizontal: 20,
    marginBottom: 25,
  },
  withdrawSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
    textAlign: 'center',
  },
  withdrawSectionDescription: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  withdrawAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 20,
  },
  withdrawAmountButton: {
    width: '47%',
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawAmountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  withdrawCustomAmount: {
    marginBottom: 10,
  },
  withdrawCustomAmountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
    textAlign: 'center',
  },
  withdrawCustomAmountInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
    fontSize: 16,
    textAlign: 'center',
  },
  depositCustomAmountInput: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#FF9800',
    fontSize: 16,
    textAlign: 'center',
  },
  withdrawCustomAmountButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawCustomAmountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // 存錢目標模態框樣式
  goalEditPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  dreamPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  dreamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1976D2',
  },
  dreamTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  dreamContent: {
    flex: 1,
    padding: 20,
  },
  dreamForm: {
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dreamLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dreamInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dreamCreateButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  dreamCreateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dreamPlanCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  dreamPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  dreamPlanMeta: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 4,
  },
  goalEditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1976D2',
  },
  goalEditTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  goalEditContent: {
    flex: 1,
    padding: 20,
  },
  goalEditForm: {
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalEditLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  goalEditInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  goalEditButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  goalEditButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalSection: {
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    flex: 1,
  },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  goalInput: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    fontSize: 14,
    textAlign: 'center',
  },
  goalInputLabel: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 4,
  },
  goalProgressText: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
    marginTop: 8,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 4,
  },
  goalProgressContainer: {
    marginBottom: 15,
  },
  goalProgressBar: {
    height: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  goalProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 8,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalDeadline: {
    fontSize: 14,
    color: '#666',
  },
  goalDaysLeft: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  goalCompleted: {
    backgroundColor: '#C8E6C9',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  goalCompletedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  claimRewardButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  claimRewardButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalStatsSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  totalStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 15,
    textAlign: 'center',
  },
  totalStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalStatItem: {
    alignItems: 'center',
  },
  totalStatLabel: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 5,
  },
  totalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
  },
  foodItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },
  foodItemQuantity: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  foodItemEffect: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // 記帳樣式
  accountingModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  accountingSection: {
    marginBottom: 20,
  },
  amountInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#90CAF9',
    fontSize: 18,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90CAF9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1565C0',
  },
  typeButtonText: {
    fontSize: 15,
    color: '#1976D2',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  categoryChipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#90CAF9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  categoryChipIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#1565C0',
    fontWeight: 'bold',
  },
  // 月報表樣式
  monthlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthSelector: {
    backgroundColor: '#F8FBFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  monthSelectorText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  monthlyStats: {
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  monthlyOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  monthlyStatItem: {
    alignItems: 'center',
  },
  monthlyStatLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  monthlyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryStats: {
    gap: 12,
  },
  categoryStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryStatIcon: {
    fontSize: 16,
  },
  categoryStatName: {
    fontSize: 14,
    color: '#333',
  },
  categoryStatRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryStatAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  categoryStatPercent: {
    fontSize: 12,
    color: '#666',
    width: 36,
    textAlign: 'right',
  },
  // 搜尋與篩選樣式
  searchFilterHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 8,
    fontSize: 14,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  filterButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  filterPanel: {
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  // 交易列表樣式更新
  transactionCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transactionCategoryIcon: {
    fontSize: 14,
  },
  transactionCategoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  // 左滑刪除樣式
  transactionContainer: {
    marginBottom: 6,
  },
  transactionRowContainer: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F44336',
  },
  deleteButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  // 編輯模態框樣式
  editModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 14,
  },
  addTransactionButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addTransactionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 50,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  transactionAmount: {
    width: 90,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  transactionInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  transactionNote: {
    fontSize: 12,
    color: '#999',
  },
  transactionDate: {
    width: 80,
    fontSize: 14,
    color: '#424242',
    textAlign: 'left',
    fontWeight: '500',
    marginRight: 0,
  },
  // 記帳全頁
  accountingPage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5',
    zIndex: 998,
  },
  accountingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#F8FBFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  accountingContent: {
    padding: 20,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 15,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  confirmButtonActive: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  // 玩具確認框樣式
  toyItemDisplay: {
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  toyItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },
  toyItemQuantity: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  toyItemEffect: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // 美容服務確認框樣式
  groomingItemDisplay: {
    backgroundColor: '#F8FBFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  groomingItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },
  groomingItemQuantity: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  groomingItemEffect: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // 完美狀態指示器樣式
  perfectStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8FBFF',
  },
  perfectStatusIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  perfectStatusIconActive: {
    color: '#FFD700', // 完美黃色星星
  },
  perfectStatusIconInactive: {
    color: '#CCCCCC', // 灰色星星
  },
  perfectStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  // 記帳彈幕樣式
  accountingDanmaku: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  accountingDanmakuText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E65100',
    backgroundColor: 'rgba(255, 235, 205, 0.98)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFB74D',
    overflow: 'hidden',
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
    transform: [{ scale: 1 }],
  },
  goalInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#E3F2FD',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  editRow: {
    flexDirection: 'row',
    gap: 10,
  },
}); 