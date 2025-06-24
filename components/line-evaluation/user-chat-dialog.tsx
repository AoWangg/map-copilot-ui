import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import type { UserData } from "@/lib/tools";

type UserChatDialogProps = {
  user: UserData;
  className?: string;
  initialBusName?: string | null;
  adjustmentPlan?: string | null;
};

// 内部聊天组件，用于提供用户上下文
function UserChatContent({
  user,
  initialBusName,
  adjustmentPlan,
}: {
  user: UserData;
  initialBusName?: string | null;
  adjustmentPlan?: string | null;
}) {
  useCopilotReadable({
    description: `上海市进行了一项公交线路调整，${initialBusName}线路调整了，调整方案是${adjustmentPlan}。
    你是一位参与此次问卷调查的用户，你的个人信息如下，你要根据你的个人信息，以第一人称视角来回答用户的问题。
    你的基本信息：
    - 性别：${user.parsedData.gender}
    - 年龄：${user.parsedData.age}岁
    - 职业：${user.parsedData.surveyData.background.occupation || "未提供"}
    - 居住地：${user.parsedData.residenceDistrict || "未提供"}
    - 上班地：${user.parsedData.workDistrict || "未提供"}
    - 主要出行方式：${
      user.parsedData.surveyData.background.commonTransportModes
    }
    - 对公交调整的态度：${
      user.parsedData.surveyData.openQuestions.evaluationOfAdjustment
    }
    - 主要不便：${user.parsedData.surveyData.openQuestions.inconveniences}`,
    value: user,
  });

  return (
    <CopilotChat
      className="h-full"
      labels={{
        title: `与用户对话 - ${user.parsedData.gender}性 ${user.parsedData.age}岁`,
        initial: `你好！我是${user.parsedData.gender}性，${
          user.parsedData.age
        }岁，职业是${
          user.parsedData.surveyData.background.occupation || "未提供"
        }。我参与了这次公交线路调整的问卷调查。有什么想了解的吗？`,
        placeholder: "输入你的问题...",
        error: "发生错误，请重试",
      }}
      ResponseButton={({ onClick }) => (
        <Button onClick={onClick}>重新生成回答</Button>
      )}
    />
  );
}

export function UserChatDialog({
  user,
  initialBusName,
  adjustmentPlan,
}: UserChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          与用户对话
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {user.parsedData.gender}性 {user.parsedData.age}岁，职业是
              {user.parsedData.surveyData.background.occupation || "未提供"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <CopilotKit
          runtimeUrl="/api/copilotkit"
          transcribeAudioUrl="/api/transcribe"
          textToSpeechUrl="/api/tts"
          key={user.parsedData.addressId}
        >
          <UserChatContent
            user={user}
            initialBusName={initialBusName}
            adjustmentPlan={adjustmentPlan}
          />
        </CopilotKit>
      </DialogContent>
    </Dialog>
  );
}
