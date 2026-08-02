"use client";

import * as z from "zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Course title is required.",
  }),
});

const CreateCoursePage = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/courses", values);

      toast.success("Course created successfully!");

      router.push(`/teacher/courses/${response.data.id}`);
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-5xl items-center justify-center p-6">
      <div className="w-full">
        <h1 className="text-2xl font-bold">Name Your Course</h1>

        <p className="mt-2 text-sm text-slate-600">
          What would you like to name your course? Don't worry, you can change
          this later.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>

                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. React for Beginners"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Give your course a clear and descriptive title.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Link href="/">
                <Button type="button" variant="ghost" disabled={isSubmitting}>
                  Cancel
                </Button>
              </Link>

              <Button type="submit" disabled={!isValid || isSubmitting}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
