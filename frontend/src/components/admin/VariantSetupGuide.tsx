import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X, CheckCircle2, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface VariantSetupGuideProps {
  onClose?: () => void;
}

const VariantSetupGuide: React.FC<VariantSetupGuideProps> = ({ onClose }) => {
  const { t } = useTranslation(['admin', 'common']);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: t('admin:variants.guide.step1.title', { defaultValue: '步骤 1: 启用变体' }),
      content: t('admin:variants.guide.step1.content', {
        defaultValue: '勾选"启用商品变体"复选框，这样您就可以为商品设置不同的属性组合（如颜色、尺寸等）。',
      }),
    },
    {
      title: t('admin:variants.guide.step2.title', { defaultValue: '步骤 2: 选择或创建属性' }),
      content: t('admin:variants.guide.step2.content', {
        defaultValue:
          '有两种方式：\n1. 点击"应用模板"快速选择预设模板（如服装标准：颜色+尺寸）\n2. 点击"创建属性"手动创建新属性（如颜色、尺寸、材质等）\n\n然后从列表中选择需要的属性。',
      }),
    },
    {
      title: t('admin:variants.guide.step3.title', { defaultValue: '步骤 3: 设置属性值' }),
      content: t('admin:variants.guide.step3.content', {
        defaultValue:
          '为每个选中的属性添加可能的值。例如：\n- 颜色：红色、蓝色、绿色\n- 尺寸：S、M、L、XL\n\n点击属性下方的"添加值"按钮来添加。',
      }),
    },
    {
      title: t('admin:variants.guide.step4.title', { defaultValue: '步骤 4: 生成变体' }),
      content: t('admin:variants.guide.step4.content', {
        defaultValue:
          '设置基础价格和默认库存，然后点击"生成变体"按钮。系统会自动创建所有可能的属性组合（如：红色-S、红色-M、蓝色-S等）。\n\n您可以在价格预览表格中查看所有变体的价格。',
      }),
    },
    {
      title: t('admin:variants.guide.step5.title', { defaultValue: '步骤 5: 编辑变体' }),
      content: t('admin:variants.guide.step5.content', {
        defaultValue:
          '生成变体后，您可以：\n- 在表格或卡片视图中查看所有变体\n- 点击"快速编辑"修改价格、库存\n- 点击"详细编辑"设置每个变体的图片、SKU等\n- 使用批量编辑功能同时修改多个变体',
      }),
    },
  ];

  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="text-brand-blue" size={24} />
          <h3 className="text-lg font-semibold text-text-primary">
            {t('admin:variants.guide.title', { defaultValue: '变体设置指南' })}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            aria-label={t('common:close', { defaultValue: '关闭' })}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 当前步骤 */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-brand-blue">
              {steps[currentStep].title}
            </span>
            <span className="text-xs text-text-tertiary">
              ({currentStep + 1} / {steps.length})
            </span>
          </div>
          <p className="text-sm text-text-secondary whitespace-pre-line">
            {steps[currentStep].content}
          </p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`flex-1 h-2 rounded transition-all ${
                index === currentStep
                  ? 'bg-brand-blue'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
              aria-label={`步骤 ${index + 1}`}
            />
          ))}
        </div>

        {/* 导航按钮 */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            {t('common:previous', { defaultValue: '上一步' })}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              } else if (onClose) {
                onClose();
              }
            }}
          >
            {currentStep < steps.length - 1 ? (
              <>
                {t('common:next', { defaultValue: '下一步' })}
                <ArrowRight size={16} className="ml-1" />
              </>
            ) : (
              <>
                <CheckCircle2 size={16} className="mr-1" />
                {t('common:gotIt', { defaultValue: '我知道了' })}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VariantSetupGuide;

